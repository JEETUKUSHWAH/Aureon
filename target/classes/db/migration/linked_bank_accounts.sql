CREATE TABLE linked_bank_accounts (
                                      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                      company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                                      account_id          UUID REFERENCES accounts(id),          -- platform account to fund

    -- External bank details (the company's real bank)
                                      bank_name           VARCHAR(255) NOT NULL,
                                      account_holder_name VARCHAR(255) NOT NULL,
                                      routing_number      VARCHAR(9)   NOT NULL,
                                      external_account_no VARCHAR(50)  NOT NULL,
                                      account_type        VARCHAR(20)  NOT NULL DEFAULT 'CHECKING'
                                          CHECK (account_type IN ('CHECKING','SAVINGS')),
                                      currency            CHAR(3)      NOT NULL DEFAULT 'USD',

    -- Verification state
                                      status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                                          CHECK (status IN (
                                                            'PENDING',          -- just submitted
                                                            'MICRO_SENT',       -- micro-deposits dispatched
                                                            'AWAITING_VERIFY',  -- waiting for company to confirm amounts
                                                            'VERIFIED',         -- confirmed ownership
                                                            'FAILED',           -- too many wrong attempts
                                                            'REMOVED'
                                              )),

    -- Micro-deposit tracking (amounts stored hashed in real system; plain here for demo)
                                      micro_deposit_1     NUMERIC(6,2),
                                      micro_deposit_2     NUMERIC(6,2),
                                      micro_sent_at       TIMESTAMPTZ,
                                      micro_expires_at    TIMESTAMPTZ,   -- amounts expire after 3 days
                                      verify_attempts     INTEGER DEFAULT 0,
                                      max_attempts        INTEGER DEFAULT 3,

    -- Audit
                                      added_by            UUID REFERENCES team_members(id),
                                      verified_at         TIMESTAMPTZ,
                                      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_linked_accounts_company ON linked_bank_accounts(company_id);

CREATE TRIGGER trg_linked_accounts_updated
    BEFORE UPDATE ON linked_bank_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();