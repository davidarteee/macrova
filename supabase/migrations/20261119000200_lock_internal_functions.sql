-- Internal trigger functions must not be callable through the REST API.
-- (get_strava_status stays callable by authenticated users on purpose: it only returns the caller's own row.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
