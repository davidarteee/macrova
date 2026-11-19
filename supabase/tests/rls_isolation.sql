-- RLS isolation test. Creates two throw-away users, exercises policies as each of them,
-- and ALWAYS rolls back by raising at the end. Success message: RLS_TESTS_PASSED.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  fa uuid := gen_random_uuid();
  gf uuid := gen_random_uuid();
  n int;
  denied boolean;
  claims_a text; claims_b text;
begin
  insert into auth.users (id, email, aud, role) values
    (a, 'rls-a-' || a || '@test.invalid', 'authenticated', 'authenticated'),
    (b, 'rls-b-' || b || '@test.invalid', 'authenticated', 'authenticated');
  claims_a := json_build_object('sub', a, 'role', 'authenticated')::text;
  claims_b := json_build_object('sub', b, 'role', 'authenticated')::text;

  -- bootstrap trigger created the default rows
  select count(*) into n from public.meal_types where user_id = a;
  if n <> 6 then raise exception 'FAIL bootstrap meal_types=%', n; end if;

  -- global catalog row + service-only Strava row (as postgres)
  insert into public.foods (id, source, source_ref, name, kcal_100, protein_100, carbs_100, fat_100)
    values (gf, 'off', 'test-' || gf, 'Global food', 100, 1, 1, 1);
  insert into public.strava_connections (user_id, athlete_id, access_token, refresh_token, expires_at)
    values (a, 1, 'x', 'y', now());

  -- ===== act as A
  perform set_config('request.jwt.claims', claims_a, true);
  set local role authenticated;
  insert into public.foods (id, owner_id, source, name, kcal_100, protein_100, carbs_100, fat_100)
    values (fa, a, 'user', 'A custom', 50, 1, 1, 1);
  insert into public.food_log_entries (user_id, log_date, name, quantity, quantity_base, kcal, protein_g, carbs_g, fat_g, per_100, source)
    values (a, current_date, 'A entry', 100, 100, 50, 1, 1, 1, '{}', 'user');
  select count(*) into n from public.food_log_entries;
  if n <> 1 then raise exception 'FAIL A should see own entry, saw %', n; end if;
  begin
    insert into public.foods (owner_id, source, source_ref, name, kcal_100, protein_100, carbs_100, fat_100)
      values (null, 'off', 'hack', 'fake global', 1, 1, 1, 1);
    raise exception 'FAIL A inserted a global food';
  exception when insufficient_privilege then null; end;
  select count(*) into n from public.get_strava_status();
  if n <> 1 then raise exception 'FAIL A strava status rows=%', n; end if;
  reset role;

  -- ===== act as B
  perform set_config('request.jwt.claims', claims_b, true);
  set local role authenticated;
  select count(*) into n from public.food_log_entries;
  if n <> 0 then raise exception 'FAIL B sees % of A entries', n; end if;
  select count(*) into n from public.profiles where id = a;
  if n <> 0 then raise exception 'FAIL B sees A profile'; end if;
  select count(*) into n from public.meal_types where user_id = a;
  if n <> 0 then raise exception 'FAIL B sees A meal types'; end if;
  select count(*) into n from public.foods where id = fa;
  if n <> 0 then raise exception 'FAIL B sees A custom food'; end if;
  select count(*) into n from public.foods where id = gf;
  if n <> 1 then raise exception 'FAIL B cannot see global food'; end if;
  update public.food_log_entries set kcal = 9999;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B updated % of A rows', n; end if;
  delete from public.food_log_entries;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B deleted % of A rows', n; end if;
  begin
    insert into public.food_log_entries (user_id, log_date, name, quantity, quantity_base, kcal, protein_g, carbs_g, fat_g, per_100, source)
      values (a, current_date, 'forged', 1, 1, 1, 1, 1, 1, '{}', 'user');
    raise exception 'FAIL B inserted a row owned by A';
  exception when insufficient_privilege then null; end;
  denied := false;
  begin
    perform 1 from public.strava_connections;
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL B could read strava_connections'; end if;
  select count(*) into n from public.get_strava_status();
  if n <> 0 then raise exception 'FAIL B sees A strava status'; end if;
  reset role;

  -- ===== anon has nothing
  set local role anon;
  denied := false;
  begin
    perform 1 from public.profiles;
  exception when insufficient_privilege then denied := true; end;
  if not denied then raise exception 'FAIL anon can read profiles'; end if;
  reset role;

  raise exception 'RLS_TESTS_PASSED';
end $$;
