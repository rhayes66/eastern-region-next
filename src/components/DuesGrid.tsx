import { MONTHS } from "@/lib/constants";
import { buildDuesGrid } from "@/lib/dues-grid";

const eur = (n: number) =>
  new Intl.NumberFormat("en-FI", { style: "currency", currency: "EUR" }).format(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Row = { year: string; month: string; amount: number; paid: boolean };

/** Year x month contributions table. Unpaid amounts are shown in red. */
export function DuesGrid({ dues }: { dues: Row[] }) {
  const { grid, grandTotal } = buildDuesGrid(dues);

  return (
    <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Contributions by year and month. Unpaid amounts are shown in red.
        </caption>
        <thead className="bg-black/5 text-xs uppercase text-zinc-500 dark:bg-white/10">
          <tr>
            <th scope="col" className="px-3 py-2">Year</th>
            {MONTHS.map((m) => (
              <th key={m} scope="col" className="px-3 py-2" title={cap(m)}>
                {cap(m).slice(0, 3)}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {grid.map((row) => (
            <tr key={row.year}>
              <th
                scope="row"
                className="px-3 py-2 font-medium text-green-700 dark:text-green-500"
              >
                {row.year}
              </th>
              {row.cells.map((c, i) => (
                <td
                  key={MONTHS[i]}
                  className={`px-3 py-2 ${
                    c && !c.paid ? "font-medium text-red-600 dark:text-red-400" : ""
                  }`}
                >
                  {c ? (
                    <>
                      {eur(c.amount)}
                      {!c.paid && <span className="sr-only"> (unpaid)</span>}
                    </>
                  ) : (
                    <span className="text-zinc-400">–</span>
                  )}
                </td>
              ))}
              <td className="px-3 py-2 text-right font-medium">{eur(row.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-black/5 font-semibold dark:bg-white/10">
            <th scope="row" colSpan={13} className="px-3 py-2 text-left">
              Total contributions
            </th>
            <td className="px-3 py-2 text-right">{eur(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
