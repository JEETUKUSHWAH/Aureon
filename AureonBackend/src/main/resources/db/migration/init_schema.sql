CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── COMPANIES ────────────────────────────────────────────────────────────────
CREATE TABLE companies (
                           id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           legal_name       VARCHAR(255) NOT NULL,
                           display_name     VARCHAR(255),
                           ein              VARCHAR(20),                        -- Employer Identification Number
                           business_type    VARCHAR(50) CHECK (business_type IN ('LLC','C_CORP','S_CORP','SOLE_PROP','PARTNERSHIP','NON_PROFIT')),
                           industry         VARCHAR(100),
                           website          VARCHAR(255),
                           phone            VARCHAR(20),
                           address_line1    TEXT,
                           address_line2    TEXT,
                           city             VARCHAR(100),
                           state            VARCHAR(50),
                           country          CHAR(2) DEFAULT 'IN',
                           postal_code      VARCHAR(20),
                           kyb_status       VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                               CHECK (kyb_status IN ('PENDING','UNDER_REVIEW','APPROVED','REJECTED','INFO_REQUIRED')),
                           kyb_reference    VARCHAR(100),
                           status           VARCHAR(20) NOT NULL DEFAULT 'ONBOARDING'
                               CHECK (status IN ('ONBOARDING','ACTIVE','SUSPENDED','CLOSED')),
                           created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                           updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────
CREATE TABLE team_members (
                              id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                              email            VARCHAR(255) NOT NULL,
                              password_hash    TEXT,
                              first_name       VARCHAR(100) NOT NULL,
                              last_name        VARCHAR(100) NOT NULL,
                              phone            VARCHAR(20),
                              role             VARCHAR(30) NOT NULL DEFAULT 'MEMBER'
                                  CHECK (role IN ('OWNER','ADMIN','MEMBER','BOOKKEEPER','VIEWER')),
                              status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                                  CHECK (status IN ('ACTIVE','INVITED','SUSPENDED','REMOVED')),
                              invite_token     VARCHAR(100),
                              invite_expires   TIMESTAMPTZ,
                              last_login       TIMESTAMPTZ,
                              failed_attempts  INTEGER DEFAULT 0,
                              locked_until     TIMESTAMPTZ,
                              created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                              UNIQUE (company_id, email)
);
CREATE INDEX idx_team_email ON team_members(email);
CREATE INDEX idx_team_company ON team_members(company_id);

-- ─── REFRESH TOKENS ───────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
                                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                member_id   UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
                                token       TEXT UNIQUE NOT NULL,
                                expires_at  TIMESTAMPTZ NOT NULL,
                                revoked     BOOLEAN DEFAULT false,
                                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── KYB VERIFICATIONS ────────────────────────────────────────────────────────
CREATE TABLE kyb_verifications (
                                   id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   company_id          UUID NOT NULL REFERENCES companies(id),
                                   ein                 VARCHAR(20),
                                   legal_name          VARCHAR(255),
                                   business_type       VARCHAR(50),
                                   incorporation_state VARCHAR(50),
                                   incorporation_date  DATE,
                                   doc_articles_url    TEXT,        -- articles of incorporation
                                   doc_ein_letter_url  TEXT,        -- IRS EIN confirmation letter
                                   beneficial_owners   JSONB,       -- [{name, ownership_pct, dob, ssn_last4}]
                                   mock_reference      VARCHAR(100),
                                   status              VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                                       CHECK (status IN ('PENDING','UNDER_REVIEW','APPROVED','REJECTED','INFO_REQUIRED')),
                                   rejection_reason    TEXT,
                                   submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   reviewed_at         TIMESTAMPTZ
);
CREATE INDEX idx_kyb_company ON kyb_verifications(company_id);

-- ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
CREATE TABLE accounts (
                          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                          account_number VARCHAR(20) UNIQUE NOT NULL,
                          routing_number VARCHAR(9) NOT NULL DEFAULT '021000021',  -- mock routing number
                          account_type   VARCHAR(20) NOT NULL CHECK (account_type IN ('CHECKING','SAVINGS')),
                          currency       CHAR(3) NOT NULL DEFAULT 'USD',
                          balance        NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
                          status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','FROZEN','CLOSED')),
                          nickname       VARCHAR(100),
                          created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_accounts_company ON accounts(company_id);

-- ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
CREATE TABLE transactions (
                              id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              company_id         UUID NOT NULL REFERENCES companies(id),
                              from_account_id    UUID REFERENCES accounts(id),
                              to_account_id      UUID REFERENCES accounts(id),
                              payment_rail       VARCHAR(20) NOT NULL
                                  CHECK (payment_rail IN ('ACH','WIRE','INTERNATIONAL','CHECK','BOOK','CARD','FEE')),
                              direction          VARCHAR(10) NOT NULL CHECK (direction IN ('DEBIT','CREDIT')),
                              amount             NUMERIC(18,2) NOT NULL CHECK (amount > 0),
                              currency           CHAR(3) NOT NULL DEFAULT 'USD',
                              fx_rate            NUMERIC(12,6) DEFAULT 1,
                              amount_usd         NUMERIC(18,2),
                              fee                NUMERIC(18,2) DEFAULT 0,
                              status             VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                  CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','REVERSED','CANCELLED')),
                              description        TEXT,
                              reference          VARCHAR(100),
                              counterparty_name  VARCHAR(255),
                              counterparty_acct  VARCHAR(50),
                              counterparty_routing VARCHAR(9),
                              memo               VARCHAR(255),
                              category           VARCHAR(50),
                              approval_required  BOOLEAN DEFAULT false,
                              approved_by        UUID REFERENCES team_members(id),
                              initiated_by       UUID REFERENCES team_members(id),
                              scheduled_at       TIMESTAMPTZ,
                              settled_at         TIMESTAMPTZ,
                              created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tx_company    ON transactions(company_id, created_at DESC);
CREATE INDEX idx_tx_from_acct  ON transactions(from_account_id);
CREATE INDEX idx_tx_to_acct    ON transactions(to_account_id);
CREATE INDEX idx_tx_status     ON transactions(status);

-- ─── APPROVAL REQUESTS ────────────────────────────────────────────────────────
CREATE TABLE approval_requests (
                                   id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   company_id      UUID NOT NULL REFERENCES companies(id),
                                   transaction_id  UUID REFERENCES transactions(id),
                                   requested_by    UUID NOT NULL REFERENCES team_members(id),
                                   approved_by     UUID REFERENCES team_members(id),
                                   policy_name     VARCHAR(100),
                                   amount          NUMERIC(18,2) NOT NULL,
                                   status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                       CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED')),
                                   notes           TEXT,
                                   expires_at      TIMESTAMPTZ,
                                   created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                   resolved_at     TIMESTAMPTZ
);
CREATE INDEX idx_approval_company ON approval_requests(company_id, status);

-- ─── VIRTUAL CARDS ────────────────────────────────────────────────────────────
CREATE TABLE virtual_cards (
                               id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               company_id      UUID NOT NULL REFERENCES companies(id),
                               account_id      UUID NOT NULL REFERENCES accounts(id),
                               issued_to       UUID NOT NULL REFERENCES team_members(id),
                               card_number     VARCHAR(19) NOT NULL,           -- masked: **** **** **** 4242
                               last_four       CHAR(4) NOT NULL,
                               expiry_month    SMALLINT NOT NULL,
                               expiry_year     SMALLINT NOT NULL,
                               card_type       VARCHAR(20) DEFAULT 'VIRTUAL' CHECK (card_type IN ('VIRTUAL')),
                               status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                                   CHECK (status IN ('ACTIVE','FROZEN','CANCELLED')),
                               spending_limit  NUMERIC(18,2),
                               limit_period    VARCHAR(10) CHECK (limit_period IN ('DAILY','WEEKLY','MONTHLY','TOTAL')),
                               spent_amount    NUMERIC(18,2) DEFAULT 0,
                               allowed_categories JSONB,                       -- null = all, or ["SOFTWARE","TRAVEL"]
                               nickname        VARCHAR(100),
                               created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                               updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cards_company ON virtual_cards(company_id);
CREATE INDEX idx_cards_member  ON virtual_cards(issued_to);

-- ─── EXPENSES ─────────────────────────────────────────────────────────────────
CREATE TABLE expenses (
                          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          company_id      UUID NOT NULL REFERENCES companies(id),
                          submitted_by    UUID NOT NULL REFERENCES team_members(id),
                          transaction_id  UUID REFERENCES transactions(id),
                          card_id         UUID REFERENCES virtual_cards(id),
                          amount          NUMERIC(18,2) NOT NULL,
                          currency        CHAR(3) NOT NULL DEFAULT 'USD',
                          merchant_name   VARCHAR(255),
                          category        VARCHAR(50),
                          description     TEXT,
                          receipt_url     TEXT,
                          reimbursable    BOOLEAN DEFAULT false,
                          status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING','APPROVED','REJECTED','REIMBURSED')),
                          reviewed_by     UUID REFERENCES team_members(id),
                          reviewed_at     TIMESTAMPTZ,
                          created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_expenses_company ON expenses(company_id);
CREATE INDEX idx_expenses_member  ON expenses(submitted_by);

-- ─── VENDORS ──────────────────────────────────────────────────────────────────
CREATE TABLE vendors (
                         id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         company_id      UUID NOT NULL REFERENCES companies(id),
                         name            VARCHAR(255) NOT NULL,
                         email           VARCHAR(255),
                         bank_name       VARCHAR(255),
                         account_number  VARCHAR(50),
                         routing_number  VARCHAR(9),
                         payment_method  VARCHAR(20) DEFAULT 'ACH'
                             CHECK (payment_method IN ('ACH','WIRE','CHECK','INTERNATIONAL')),
                         currency        CHAR(3) DEFAULT 'USD',
                         address         TEXT,
                         notes           TEXT,
                         created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vendors_company ON vendors(company_id);

-- ─── INVOICES ─────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
                          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          company_id      UUID NOT NULL REFERENCES companies(id),
                          account_id      UUID NOT NULL REFERENCES accounts(id),
                          invoice_number  VARCHAR(50) NOT NULL,
                          client_name     VARCHAR(255) NOT NULL,
                          client_email    VARCHAR(255),
                          client_address  TEXT,
                          line_items      JSONB NOT NULL,    -- [{description, qty, unit_price, amount}]
                          subtotal        NUMERIC(18,2) NOT NULL,
                          tax_rate        NUMERIC(5,2) DEFAULT 0,
                          tax_amount      NUMERIC(18,2) DEFAULT 0,
                          total_amount    NUMERIC(18,2) NOT NULL,
                          currency        CHAR(3) NOT NULL DEFAULT 'USD',
                          status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                              CHECK (status IN ('DRAFT','SENT','VIEWED','PAID','OVERDUE','CANCELLED')),
                          due_date        DATE,
                          paid_at         TIMESTAMPTZ,
                          transaction_id  UUID REFERENCES transactions(id),
                          notes           TEXT,
                          created_by      UUID REFERENCES team_members(id),
                          created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_company ON invoices(company_id);

-- ─── APPROVAL POLICIES ────────────────────────────────────────────────────────
CREATE TABLE approval_policies (
                                   id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   company_id      UUID NOT NULL REFERENCES companies(id),
                                   name            VARCHAR(100) NOT NULL,
                                   payment_rail    VARCHAR(20),          -- null = all rails
                                   amount_above    NUMERIC(18,2) NOT NULL DEFAULT 0,
                                   requires_role   VARCHAR(30) NOT NULL DEFAULT 'ADMIN',
                                   num_approvers   INTEGER NOT NULL DEFAULT 1,
                                   active          BOOLEAN DEFAULT true,
                                   created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ACCOUNTING EXPORTS ───────────────────────────────────────────────────────
CREATE TABLE accounting_exports (
                                    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    company_id      UUID NOT NULL REFERENCES companies(id),
                                    export_type     VARCHAR(20) NOT NULL CHECK (export_type IN ('QUICKBOOKS','XERO','CSV')),
                                    from_date       DATE NOT NULL,
                                    to_date         DATE NOT NULL,
                                    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                                        CHECK (status IN ('PENDING','COMPLETED','FAILED')),
                                    file_url        TEXT,
                                    record_count    INTEGER,
                                    created_by      UUID REFERENCES team_members(id),
                                    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── AUDIT LOG ────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
                           id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           company_id      UUID REFERENCES companies(id),
                           actor_id        UUID REFERENCES team_members(id),
                           action          VARCHAR(100) NOT NULL,
                           resource_type   VARCHAR(50),
                           resource_id     UUID,
                           details         JSONB,
                           ip_address      INET,
                           created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_company ON audit_log(company_id, created_at DESC);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               member_id   UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
                               company_id  UUID NOT NULL REFERENCES companies(id),
                               type        VARCHAR(50) NOT NULL,
                               title       VARCHAR(200) NOT NULL,
                               body        TEXT NOT NULL,
                               metadata    JSONB DEFAULT '{}',
                               read        BOOLEAN DEFAULT false,
                               created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_member ON notifications(member_id, read, created_at DESC);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated   BEFORE UPDATE ON companies      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_members_updated     BEFORE UPDATE ON team_members   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_accounts_updated    BEFORE UPDATE ON accounts       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cards_updated       BEFORE UPDATE ON virtual_cards  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated    BEFORE UPDATE ON invoices       FOR EACH ROW EXECUTE FUNCTION update_updated_at();