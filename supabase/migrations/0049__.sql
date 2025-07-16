-- Delete the generic entry to replace it with specific ones
DELETE FROM public.institutions WHERE name = 'Moroccan University';

-- Insert all Moroccan universities and their domains
INSERT INTO public.institutions (name, approved_domains)
VALUES
  ('Ministère de l''Éducation Nationale (Taalim)', ARRAY['taalim.ma', 'men.gov.ma']),
  ('Académie Régionale de Drâa-Tafilalet', ARRAY['arefdt.ma']),
  ('Académie Régionale de Tanger-Tétouan-Al Hoceima', ARRAY['crmeftth.ma']),
  ('Académie Régionale de Guelmim-Oued Noun', ARRAY['rgon.ma']),
  ('Universiapolis – Université Internationale d''Agadir', ARRAY['universiapolis.ma']),
  ('UIC – Université Internationale de Casablanca', ARRAY['uic.ac.ma']),
  ('Université Mundiapolis', ARRAY['mundiapolis.ma']),
  ('UM6SS – Université Mohammed VI des Sciences de la Santé', ARRAY['um6ss.ma']),
  ('UPF – Université Privée de Fès', ARRAY['upf.ac.ma']),
  ('UPM – Université Privée de Marrakech', ARRAY['upm.ac.ma']),
  ('UIR – Université Internationale de Rabat', ARRAY['uir.ac.ma']),
  ('UM6P – Université Mohammed VI Polytechnique', ARRAY['um6p.ma']),
  ('HEM Business School', ARRAY['hem.ac.ma']),
  ('ESAV Marrakech', ARRAY['esavmarrakech.com']),
  ('UIASS – Université Internationale Abulcasis des Sciences de la Santé', ARRAY['uiass.ma']),
  ('Université Mohammed V de Rabat', ARRAY['um5.ac.ma']),
  ('Université Hassan II de Casablanca', ARRAY['univh2c.ma']),
  ('Université Sidi Mohamed Ben Abdellah de Fès', ARRAY['usmba.ac.ma']),
  ('Université Mohammed Premier d''Oujda', ARRAY['ump.ma']),
  ('Université Cadi Ayyad de Marrakech', ARRAY['uca.ma', 'ucam.ac.ma']),
  ('Université Moulay Ismail de Meknès', ARRAY['umi.ac.ma']),
  ('Université Abdelmalek Essaâdi de Tétouan', ARRAY['uae.ac.ma']),
  ('Université Chouaïb Doukkali d''El Jadida', ARRAY['ucd.ac.ma']),
  ('Université Ibn Tofail de Kénitra', ARRAY['uit.ac.ma', 'univ-ibntofail.ac.ma']),
  ('Université Ibn Zohr d''Agadir', ARRAY['uiz.ac.ma']),
  ('Université Hassan Ier de Settat', ARRAY['uh1.ac.ma', 'uhp.ac.ma']),
  ('Université Sultan Moulay Slimane de Beni Mellal', ARRAY['usms.ac.ma', 'usms.ma']),
  ('Al Akhawayn University in Ifrane', ARRAY['aui.ma']),
  ('Université Euromed de Fès', ARRAY['ueuromed.org']),
  ('Moroccan Academic Institutions', ARRAY['ac.ma'])
ON CONFLICT (name) DO NOTHING;