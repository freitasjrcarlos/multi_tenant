ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_only_see_companies_they_belong_to" ON companies;
DROP POLICY IF EXISTS "users_can_only_see_their_own_memberships" ON memberships;
DROP POLICY IF EXISTS "users_can_only_see_invites_for_their_companies" ON invites;

CREATE POLICY "users_can_only_see_companies_they_belong_to" ON companies
  FOR ALL
  USING (
    id IN (
      SELECT "companyId" 
      FROM memberships 
      WHERE "userId" = current_setting('app.user_id', true)::text
        AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "users_can_only_see_their_own_memberships" ON memberships
  FOR ALL
  USING (
    "companyId" IN (
      SELECT "companyId" 
      FROM memberships 
      WHERE "userId" = current_setting('app.user_id', true)::text
        AND "deletedAt" IS NULL
    )
  );

CREATE POLICY "users_can_only_see_invites_for_their_companies" ON invites
  FOR ALL
  USING (
    "companyId" IN (
      SELECT "companyId" 
      FROM memberships 
      WHERE "userId" = current_setting('app.user_id', true)::text
        AND "deletedAt" IS NULL
    )
  );

