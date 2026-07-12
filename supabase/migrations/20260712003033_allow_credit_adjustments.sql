/*
# Allow credit adjustments (add and subtract)

## Changes
- Replaces `admin_grant_credits` function to support both positive and negative credit values
- Adds floor check: deductions that would drop a user below 0 credits are rejected
- Negative `p_credits` values subtract credits; positive values add credits
- The `credit_grants` table already supports negative `credits_granted` for audit

## Security
- Retains SECURITY DEFINER with admin check
- Credits can never go below zero

## Important Notes
1. The function now accepts any non-zero integer for p_credits
2. When p_credits is negative, the function checks that the user has enough credits before deducting
3. The credit_grants table records the actual adjustment value (negative for deductions)
*/

CREATE OR REPLACE FUNCTION public.admin_grant_credits(
  p_admin_uid uuid,
  p_recipient_email text,
  p_credits integer,
  p_note text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_recipient_id uuid;
  v_recipient_email text;
  v_current_credits integer;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_admin_uid AND is_admin = true) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Find recipient by email
  SELECT id, email, credits INTO v_recipient_id, v_recipient_email, v_current_credits
  FROM profiles WHERE email = p_recipient_email LIMIT 1;

  IF v_recipient_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Floor check: prevent credits from going below zero
  IF (v_current_credits + p_credits) < 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient credits. User only has ' || v_current_credits || ' credit(s).');
  END IF;

  -- Adjust credits
  UPDATE profiles SET credits = credits + p_credits WHERE id = v_recipient_id;

  -- Record adjustment
  INSERT INTO credit_grants (admin_user_id, recipient_user_id, credits_granted, note)
  VALUES (p_admin_uid, v_recipient_id, p_credits, p_note);

  RETURN json_build_object('success', true, 'recipient_email', v_recipient_email, 'credits', p_credits);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;