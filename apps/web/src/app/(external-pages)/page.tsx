import { Separator } from '@/components/ui/separator';
import { ArrowRight, Database, Lock, Palette, Shield, Zap } from 'lucide-react';
import { HomeCTA } from './home-cta';
import { HomeFeatures, type HomeFeature } from './home-features';
import { HomeHero } from './home-hero';
import { createClient } from '@/supabase-clients/server';

const features: HomeFeature[] = [
  {
    icon: Shield,
    title: 'Type-Safe',
    description: 'End-to-end TypeScript with auto-generated Supabase types. Catch errors at compile time.',
  },
  {
    icon: Zap,
    title: 'Modern Stack',
    description: 'Next.js 16, TypeScript, Supabase, and Tailwind CSS — the best tools for modern web development.',
  },
  {
    icon: Palette,
    title: 'UI Components',
    description: 'Beautiful components built with Radix UI and Tailwind. Accessible and customizable.',
  },
  {
    icon: Lock,
    title: 'Authentication',
    description: 'Magic links, OAuth providers, and email/password with protected routes — all pre-configured.',
  },
  {
    icon: Database,
    title: 'Database Ready',
    description: 'Supabase with Row Level Security, migrations, and seed data — ready for production.',
  },
  {
    icon: ArrowRight,
    title: 'Fast Deployment',
    description: 'Deploy to Vercel in minutes. CI/CD, preview deployments, and automatic type generation included.',
  },
];

export default async function Page() {
  // 서버 측에서 안전하게 세션 확인 (대시보드와 동일한 방식)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div>
      <HomeHero isLoggedIn={isLoggedIn} />
      <Separator />
      <HomeFeatures features={features} />
      <div className="border-t bg-muted/10">
        <HomeCTA />
      </div>
    </div>
  );
}