'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase-clients/client';
import type { User } from '@supabase/supabase-js';
import { Github, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Nextbase home" className="shrink-0">
          <Brand />
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigation.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'bg-transparent text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
            <Link
              href="https://github.com/imbhargav5/nextbase-nextjs-supabase-starter"
              target="_blank"
              rel="noreferrer"
            >
              <Github aria-hidden="true" />
              GitHub
            </Link>
          </Button>
          <ModeToggle />

          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu aria-hidden="true" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-[min(22rem,85vw)] flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription>
                  Everything you need to start and ship your next product.
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-6 grid gap-1">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 pt-8">
                {user ? (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/dashboard">
                          <LayoutDashboard className="size-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" className="justify-start text-red-500" onClick={handleSignOut}>
                        <LogOut className="size-4 mr-2" />
                        Sign out
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="/sign-up">Get started</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}