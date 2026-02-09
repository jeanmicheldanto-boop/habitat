import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔷 API /upload-image appelée');
  
  try {
    // Créer le client Supabase avec service_role à l'intérieur de la fonction
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔑 Variables env présentes:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('📋 Lecture FormData...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tempId = formData.get('tempId') as string;
    const etablissementId = formData.get('etablissementId') as string;
    
    console.log('📦 Données reçues:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      tempId,
      etablissementId
    });
    
    // Utiliser tempId (création) ou etablissementId (édition)
    const uploadId = tempId || etablissementId;
    console.log('🎯 Upload ID choisi:', uploadId);

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!uploadId) {
      return NextResponse.json(
        { error: 'ID manquant (tempId ou etablissementId requis)' },
        { status: 400 }
      );
    }

    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF' },
        { status: 400 }
      );
    }

    // Valider la taille (10MB max comme configuré dans le bucket)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 10MB' },
        { status: 400 }
      );
    }

    // Extraire l'extension
    const fileExt = file.name.split('.').pop();
    const filePath = `${uploadId}/main.${fileExt}`;

    console.log('📁 Chemin de stockage:', filePath);

    // Convertir le fichier en buffer
    console.log('🔄 Conversion en buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✅ Buffer créé, taille:', buffer.length);

    console.log('📤 Upload vers storage bucket "etablissements"...');

    // Upload avec service_role key (bypass RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('etablissements')  // ✅ CORRIGÉ: Upload dans le bon bucket
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erreur upload storage:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    console.log('✅ Upload storage réussi:', filePath);

    const responsePath = `etablissements/${filePath}`;
    console.log('📤 Envoi réponse SUCCESS avec path:', responsePath);

    return NextResponse.json({
      success: true,
      path: responsePath  // ✅ CORRIGÉ: Retourne avec le préfixe du bucket
    });

  } catch (error) {
    console.error('❌ Exception upload:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    );
  }
}
