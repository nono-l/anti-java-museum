import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, Gamepad2 } from "lucide-react";
import { SiteNav } from "@/components/museum/site-nav";
import { CostTicker } from "@/components/museum/cost-ticker";
import { IndentTrap } from "@/components/museum/indent-trap";
import { CheckedHell } from "@/components/museum/checked-hell";
import { BoilerplateTrap } from "@/components/museum/boilerplate-trap";
import { JoyCost } from "@/components/museum/joy-cost";
import { DepHell } from "@/components/museum/dep-hell";
import { AiWaste } from "@/components/museum/ai-waste";
import { LogSecrecy } from "@/components/museum/log-secrecy";
import { FwAversion } from "@/components/museum/fw-aversion";
import { ShipAndFlee } from "@/components/museum/ship-and-flee";
import { CargoCult } from "@/components/museum/cargo-cult";
import { SupplyChain } from "@/components/museum/supply-chain";
import { CompatTax } from "@/components/museum/compat-tax";
import { Handcuff } from "@/components/museum/handcuff";
import { FootprintTax } from "@/components/museum/footprint-tax";
import { TypeErasure } from "@/components/museum/type-erasure";
import { MagicRuntime } from "@/components/museum/magic-runtime";
import { Governance } from "@/components/museum/governance";
import { ResourceLeak } from "@/components/museum/resource-leak";
import { WoraMyth } from "@/components/museum/wora-myth";
import { ChargeCatalog } from "@/components/museum/charge-catalog";
import { ToolSprawl } from "@/components/museum/tool-sprawl";
import { MonoWeapon } from "@/components/museum/mono-weapon";
import { Verdict } from "@/components/museum/verdict";
import { ShareButton } from "@/components/museum/share-button";
import { BoardPanel } from "@/components/museum/board-panel";

export const Route = createFileRoute("/")({
  component: MuseumHome,
});

function MuseumHome() {
  return (
    <div className="museum-cosmos min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <SiteNav />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <p className="text-xs font-medium tracking-[0.22em] text-[var(--color-danger)]">
            COSMIC INDICTMENT · JAVA IS THE ENEMY
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-balance text-3xl font-semibold leading-tight sm:text-5xl">
            Java は
            <span className="text-[var(--color-danger)]">宇宙の敵</span>
            である
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            深刻度 70 以上の罪状はすべて展示へ。上のタブ「崩壊シミュ」では、
            Java だけを学んだエンジニアが案件で精神崩壊していくターン制シミュレーションを遊べます。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#exhibits"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] px-4 text-sm font-medium transition-colors hover:bg-[var(--color-surface)]"
            >
              告発展示へ進む
              <ArrowDown className="h-4 w-4" />
            </a>
            <Link
              to="/sim"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)] px-4 text-sm font-medium"
            >
              <Gamepad2 className="h-4 w-4" />
              崩壊シミュを開く
            </Link>
            <ShareButton size="default" variant="secondary" label="この告発をXでシェア" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <CostTicker />
        </section>

        <div id="exhibits" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 sm:px-6">
          <IndentTrap />
          <CheckedHell />
          <BoilerplateTrap />
          <JoyCost />
          <DepHell />
          <AiWaste />
          <LogSecrecy />
          <FwAversion />
          <ShipAndFlee />
          <MagicRuntime />
          <ToolSprawl />

          <div id="sev70" className="scroll-mt-20 border-t border-[var(--color-border)] pt-8">
            <p className="text-xs font-medium tracking-[0.2em] text-[var(--color-danger)]">
              SEVERITY ≥ 70 · FULL EXHIBITS
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold">
              深刻度 70 以上 — 全件展示
            </h2>
          </div>

          <CargoCult />
          <SupplyChain />
          <CompatTax />
          <Handcuff />
          <FootprintTax />
          <TypeErasure />
          <Governance />
          <ResourceLeak />
          <WoraMyth />

          <div id="charges">
            <ChargeCatalog />
          </div>
          <div id="worst">
            <MonoWeapon />
          </div>
          <div id="verdict">
            <Verdict />
          </div>
          <div id="board">
            <BoardPanel />
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[var(--color-subtle)]">
            展示タブと崩壊シミュタブは別コンテンツです。上のナビから切り替えてください。
          </p>
          <ShareButton size="sm" variant="ghost" label="シェア" />
        </div>
      </footer>
    </div>
  );
}
