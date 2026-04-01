import { HomePageContent } from "@/components/HomePageContent";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return <HomePageContent locale={locale} dict={dict} />;
}
