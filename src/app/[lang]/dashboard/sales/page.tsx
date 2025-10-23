import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { listSales, getSalesStats, SalesStats } from "@/app/actions/sales";
import SalesPageClient from "@/components/sales/SalesPageClient";
import { RegisterProvider } from "@/contexts/RegisterContext";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const result = await listSales();

  if ("error" in result) {
    return (
      <div className="p-8">
        <div className="text-red-600">{result.error}</div>
      </div>
    );
  }

  const statsResult = await getSalesStats();
  const stats = "stats" in statsResult ? statsResult.stats : null;

  return (
    <RegisterProvider>
      <SalesPageClient
        sales={result.sales}
        stats={stats as SalesStats}
        dict={dict}
        lang={lang}
      />
    </RegisterProvider>
  );
}
