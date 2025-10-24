import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import StockManager from "@/components/inventory/StockManager";

export default async function StockPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{dict.inventory.stock.title}</h1>
        <p className="text-gray-500">{dict.inventory.stock.description}</p>
      </div>

      <StockManager dict={dict} />
    </div>
  );
}
