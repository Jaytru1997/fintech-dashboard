"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { POPULAR_ASSETS } from "@/lib/constants/assets";
import { useRouter } from "next/navigation";

export default function AssetsPage() {
  const router = useRouter();

  const handleTrade = (symbol: string) => {
    router.push(`/dashboard/trading?symbol=${encodeURIComponent(symbol)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-full overflow-x-hidden"
      style={{ minWidth: 0 }}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Assets</h1>
        <p className="text-gray-400 mt-2">
          Browse the 50 most traded crypto, forex, and commodity markets. Jump straight into a trade with one click.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Popular Tradable Markets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {POPULAR_ASSETS.slice(0, 50).map((asset) => (
                  <TableRow key={asset.symbol}>
                    <TableCell>
                      <div className="font-medium text-white">{asset.name}</div>
                      <div className="text-xs text-gray-500">{asset.symbol}</div>
                    </TableCell>
                    <TableCell className="text-gray-300">{asset.pair}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-background-dark text-xs text-gray-300 border border-gray-800">
                        {asset.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleTrade(asset.symbol)}>
                        Trade
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

