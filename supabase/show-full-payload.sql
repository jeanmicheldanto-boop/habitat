-- ====================================================================
-- VOIR LE PAYLOAD COMPLET DE LA PROPOSITION
-- ====================================================================

SELECT 
  id,
  jsonb_pretty(payload) as payload_complet
FROM propositions
WHERE id = '38b4d49d-15c8-48a9-912a-0593098d426e';
