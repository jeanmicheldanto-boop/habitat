import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Créer le client Supabase avec service_role à l'intérieur de la fonction
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tempId = formData.get('tempId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!tempId) {
      return NextResponse.json(
        { error: 'ID temporaire manquant' },
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
    const filePath = `${tempId}/main.${fileExt}`;

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📤 Upload image via API:', filePath);

    // Upload avec service_role key (bypass RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('etablissements')  // ✅ CORRIGÉ: Upload dans le bon bucket
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Erreur upload:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    console.log('✅ Upload réussi:', filePath);

    return NextResponse.json({
      success: true,
      path: `etablissements/${filePath}`  // ✅ CORRIGÉ: Retourne avec le préfixe du bucket
    });

  } catch (error) {
    console.error('❌ Exception upload:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    );
  }
}
