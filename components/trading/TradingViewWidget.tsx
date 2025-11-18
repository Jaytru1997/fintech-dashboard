"use client";

import { useEffect, useId, useRef } from "react";
import clsx from "clsx";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, any>) => unknown;
    };
  }
}

const TRADING_VIEW_SCRIPT_ID = "tradingview-widget-script";
const TRADING_VIEW_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

export interface TradingViewWidgetProps {
  symbol: string;
  interval?: string;
  theme?: "light" | "dark";
  locale?: string;
  timezone?: string;
  /** Optional minimum height in pixels; widget will otherwise autosize to its container */
  minHeight?: number;
  studies?: string[];
  allowSymbolChange?: boolean;
  /** When true, widget follows container width/height responsively */
  autosize?: boolean;
  className?: string;
}

export function TradingViewWidget({
  symbol,
  interval = "15",
  theme = "dark",
  locale = "en",
  timezone = "Etc/UTC",
  minHeight = 220,
  studies = [],
  allowSymbolChange = true,
  autosize = true,
  className,
}: TradingViewWidgetProps) {
  const containerId = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const createWidget = () => {
    if (!window.TradingView || !containerRef.current) return;

    // Clear any previous widget markup to avoid stacking canvases
    containerRef.current.innerHTML = "";

    const TradingViewWidgetCtor = window.TradingView.widget;
    const backgroundColor = theme === "dark" ? "#020617" : "#ffffff";
    const config: Record<string, any> = {
      container_id: containerId,
      symbol,
      interval,
      theme,
      timezone,
      locale,
      allow_symbol_change: allowSymbolChange,
      autosize,
      studies,
      backgroundColor,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      withdateranges: true,
      details: true,
      hide_legend: false,
      toolbar_bg: backgroundColor,
    };

    // Only pass explicit height when not using autosize
    if (!autosize && minHeight) {
      config.height = minHeight;
    }

    new TradingViewWidgetCtor(config);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.TradingView) {
      createWidget();
      return;
    }

    const existingScript = document.getElementById(TRADING_VIEW_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.dataset.loaded) {
        createWidget();
      } else {
        existingScript.addEventListener("load", createWidget, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = TRADING_VIEW_SCRIPT_ID;
    script.src = TRADING_VIEW_SCRIPT_SRC;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      createWidget();
    };
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  useEffect(() => {
    if (window.TradingView) {
      createWidget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval, theme, locale, timezone, minHeight, allowSymbolChange, autosize, studies.join(",")]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={clsx("h-full w-full", className)}
      style={{ minHeight }}
    />
  );
}


