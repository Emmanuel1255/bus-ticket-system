-- Insert sample buses
INSERT INTO public.buses (bus_number, capacity, bus_type, status) VALUES
('WFB001', 50, 'Standard', 'active'),
('WFB002', 45, 'Standard', 'active'),
('WFB003', 55, 'Luxury', 'active'),
('WFB004', 50, 'Standard', 'active'),
('WFB005', 40, 'Mini', 'active');

-- Insert sample routes
INSERT INTO public.routes (origin, destination, distance_km, duration_hours, base_price, status) VALUES
('Freetown', 'Bo', 250, 4.5, 50000.00, 'active'),
('Freetown', 'Kenema', 300, 5.0, 60000.00, 'active'),
('Freetown', 'Makeni', 180, 3.5, 40000.00, 'active'),
('Bo', 'Kenema', 80, 1.5, 25000.00, 'active'),
('Freetown', 'Port Loko', 120, 2.5, 30000.00, 'active'),
('Freetown', 'Kailahun', 350, 6.0, 70000.00, 'active');

-- Insert sample schedules
INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT 
  r.id as route_id,
  b.id as bus_id,
  '06:00:00'::TIME as departure_time,
  ('06:00:00'::TIME + (r.duration_hours || ' hours')::INTERVAL)::TIME as arrival_time,
  ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as days_of_week,
  'active' as status
FROM public.routes r
CROSS JOIN public.buses b
WHERE r.origin = 'Freetown' AND r.destination = 'Bo' AND b.bus_number = 'WFB001'

UNION ALL

SELECT 
  r.id as route_id,
  b.id as bus_id,
  '14:00:00'::TIME as departure_time,
  ('14:00:00'::TIME + (r.duration_hours || ' hours')::INTERVAL)::TIME as arrival_time,
  ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as days_of_week,
  'active' as status
FROM public.routes r
CROSS JOIN public.buses b
WHERE r.origin = 'Freetown' AND r.destination = 'Kenema' AND b.bus_number = 'WFB002'

UNION ALL

SELECT 
  r.id as route_id,
  b.id as bus_id,
  '08:00:00'::TIME as departure_time,
  ('08:00:00'::TIME + (r.duration_hours || ' hours')::INTERVAL)::TIME as arrival_time,
  ARRAY['monday', 'wednesday', 'friday', 'sunday'] as days_of_week,
  'active' as status
FROM public.routes r
CROSS JOIN public.buses b
WHERE r.origin = 'Freetown' AND r.destination = 'Makeni' AND b.bus_number = 'WFB003';
