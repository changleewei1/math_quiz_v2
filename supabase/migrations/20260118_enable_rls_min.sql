-- Phase 2: Enable RLS for sensitive tables
-- Note: server APIs should use SUPABASE_SERVICE_ROLE_KEY to bypass RLS

alter table if exists students enable row level security;
alter table if exists teachers enable row level security;
alter table if exists classes enable row level security;
alter table if exists class_members enable row level security;
alter table if exists teacher_classes enable row level security;
alter table if exists questions enable row level security;
alter table if exists question_attempts enable row level security;
alter table if exists student_sessions enable row level security;
alter table if exists diagnostic_sessions enable row level security;
alter table if exists diagnostic_answers enable row level security;
alter table if exists diagnostic_results enable row level security;
alter table if exists remediation_actions enable row level security;

-- Default deny for anon. Authenticated policies are placeholders for future Supabase Auth usage.
do $$
begin
  if to_regclass('public.students') is not null then
    create policy "students_authenticated_read"
      on students for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.teachers') is not null then
    create policy "teachers_authenticated_read"
      on teachers for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.classes') is not null then
    create policy "classes_authenticated_read"
      on classes for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.class_members') is not null then
    create policy "class_members_authenticated_read"
      on class_members for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.teacher_classes') is not null then
    create policy "teacher_classes_authenticated_read"
      on teacher_classes for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.questions') is not null then
    create policy "questions_authenticated_read"
      on questions for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.question_attempts') is not null then
    create policy "question_attempts_authenticated_read"
      on question_attempts for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.student_sessions') is not null then
    create policy "student_sessions_authenticated_read"
      on student_sessions for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.diagnostic_sessions') is not null then
    create policy "diagnostic_sessions_authenticated_read"
      on diagnostic_sessions for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.diagnostic_answers') is not null then
    create policy "diagnostic_answers_authenticated_read"
      on diagnostic_answers for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.diagnostic_results') is not null then
    create policy "diagnostic_results_authenticated_read"
      on diagnostic_results for select
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if to_regclass('public.remediation_actions') is not null then
    create policy "remediation_actions_authenticated_read"
      on remediation_actions for select
      to authenticated
      using (true);
  end if;
end $$;

