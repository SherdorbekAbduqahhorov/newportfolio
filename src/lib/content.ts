import { supabase } from '@/lib/supabase';
import type {
  Message,
  MessageInput,
  PortfolioContent,
  Profile,
  ProfileInput,
  Project,
  ProjectInput,
  Skill,
  SkillInput,
} from '@/lib/types';

type QueryResult<T> = { data: T | null; error: { message: string } | null };

function unwrap<T>(result: QueryResult<T>, action: string): T {
  if (result.error) throw new Error(`${action}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${action}: no data returned`);
  return result.data;
}

function check(error: { message: string } | null, action: string): void {
  if (error) throw new Error(`${action}: ${error.message}`);
}

export async function fetchIsOwner(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_owner');
  return !error && data === true;
}

export async function fetchProfile(): Promise<Profile> {
  const result = await supabase.from('profile').select('*').eq('id', 1).maybeSingle();
  return unwrap<Profile>(result, 'Loading profile');
}

export async function updateProfile(input: ProfileInput): Promise<void> {
  const result = await supabase
    .from('profile')
    .update(input)
    .eq('id', 1)
    .select('id')
    .maybeSingle();
  unwrap(result, 'Saving profile');
}

export async function fetchSkills(): Promise<Skill[]> {
  const result = await supabase.from('skills').select('*').order('created_at', { ascending: true });
  return unwrap<Skill[]>(result, 'Loading skills');
}

export async function createSkill(input: SkillInput): Promise<void> {
  check((await supabase.from('skills').insert(input)).error, 'Adding skill');
}

export async function updateSkill(id: string, input: SkillInput): Promise<void> {
  check((await supabase.from('skills').update(input).eq('id', id)).error, 'Updating skill');
}

export async function deleteSkill(id: string): Promise<void> {
  check((await supabase.from('skills').delete().eq('id', id)).error, 'Deleting skill');
}

export async function fetchProjects(): Promise<Project[]> {
  const result = await supabase.from('projects').select('*').order('created_at', { ascending: true });
  return unwrap<Project[]>(result, 'Loading projects');
}

export async function createProject(input: ProjectInput): Promise<void> {
  check((await supabase.from('projects').insert(input)).error, 'Adding project');
}

export async function updateProject(id: string, input: ProjectInput): Promise<void> {
  check((await supabase.from('projects').update(input).eq('id', id)).error, 'Updating project');
}

export async function deleteProject(id: string): Promise<void> {
  check((await supabase.from('projects').delete().eq('id', id)).error, 'Deleting project');
}

export async function sendMessage(input: MessageInput): Promise<void> {
  check((await supabase.from('messages').insert({ ...input, is_read: false })).error, 'Sending message');
}

export async function fetchMessages(): Promise<Message[]> {
  const result = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  return unwrap<Message[]>(result, 'Loading messages');
}

export async function setMessageRead(id: string, isRead: boolean): Promise<void> {
  check((await supabase.from('messages').update({ is_read: isRead }).eq('id', id)).error, 'Updating message');
}

export async function deleteMessage(id: string): Promise<void> {
  check((await supabase.from('messages').delete().eq('id', id)).error, 'Deleting message');
}

export async function fetchPortfolio(): Promise<PortfolioContent> {
  const [profile, skills, projects] = await Promise.all([
    fetchProfile(),
    fetchSkills(),
    fetchProjects(),
  ]);
  return { profile, skills, projects };
}
