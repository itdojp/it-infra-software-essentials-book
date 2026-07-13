---
layout: chapter
title: 付録B：図表索引
---

# 付録B：図表索引

この索引は、公開本文で実際に参照している static SVG 6件だけを、本文順に案内します。asset directory の一覧ではありません。各リンクは本文内の stable anchor を直接開くため、図の前後の説明も続けて確認できます。

<ol class="figure-index-list">
  <li>
    <h2><a href="{{ '/chapters/chapter01/#figure-traditional-vs-modern-infrastructure' | relative_url }}">従来インフラ vs 現代インフラ</a></h2>
    <dl>
      <dt>掲載章</dt>
      <dd>第1章：インフラエンジニアとソフトウェアの接点</dd>
      <dt>目的</dt>
      <dd>手作業中心の運用から、クラウド、IaC、自動化を含む運用へ視点が変わる背景を整理する。</dd>
      <dt>確認観点</dt>
      <dd>自分の運用で、再現性、変更履歴、自動化のどこに手作業が残っているかを確認する。</dd>
    </dl>
  </li>
  <li>
    <h2><a href="{{ '/chapters/chapter01/#figure-devops-transformation' | relative_url }}">DevOps 変革フロー</a></h2>
    <dl>
      <dt>掲載章</dt>
      <dd>第1章：インフラエンジニアとソフトウェアの接点</dd>
      <dt>目的</dt>
      <dd>開発と運用が、共通のコードとフィードバックを通じて協働する流れを理解する。</dd>
      <dt>確認観点</dt>
      <dd>変更のレビュー、テスト、運用へのフィードバックがどこで分断されているかを確認する。</dd>
    </dl>
  </li>
  <li>
    <h2><a href="{{ '/chapters/chapter01/#figure-sre-concepts' | relative_url }}">SRE 概念図</a></h2>
    <dl>
      <dt>掲載章</dt>
      <dd>第1章：インフラエンジニアとソフトウェアの接点</dd>
      <dt>目的</dt>
      <dd>信頼性、計測、自動化を結びつけて、運用を継続的に改善する視点を示す。</dd>
      <dt>確認観点</dt>
      <dd>障害時に確認する指標、ログ、手作業の負荷を、改善対象として記録できるかを確認する。</dd>
    </dl>
  </li>
  <li>
    <h2><a href="{{ '/chapters/chapter01/#figure-learning-roadmap' | relative_url }}">学習ロードマップ</a></h2>
    <dl>
      <dt>掲載章</dt>
      <dd>第1章：インフラエンジニアとソフトウェアの接点</dd>
      <dt>目的</dt>
      <dd>本書の5章が、基礎理解から実務の変更管理までどの順序でつながるかを示す。</dd>
      <dt>確認観点</dt>
      <dd>現在の課題に必要な前提章と、次に戻って確認する章を選べるかを確認する。</dd>
    </dl>
  </li>
  <li>
    <h2><a href="{{ '/chapters/chapter02/#figure-data-description-languages-overview' | relative_url }}">データ記述言語の全体像</a></h2>
    <dl>
      <dt>掲載章</dt>
      <dd>第2章：データ記述言語の基本と実践</dd>
      <dt>目的</dt>
      <dd>JSON、YAML と周辺形式が、設定、データ交換、自動化で果たす役割を比較する。</dd>
      <dt>確認観点</dt>
      <dd>扱うデータで必要な構造、型、検証方法を説明できるかを確認する。</dd>
    </dl>
  </li>
  <li>
    <h2><a href="{{ '/chapters/chapter03/#figure-script-automation-architecture' | relative_url }}">スクリプト自動化アーキテクチャ</a></h2>
    <dl>
      <dt>掲載章</dt>
      <dd>第3章：スクリプト言語による自動化の初歩</dd>
      <dt>目的</dt>
      <dd>入力、スクリプト、外部コマンド、ログ、結果確認を分けて、安全な自動化の境界を捉える。</dd>
      <dt>確認観点</dt>
      <dd>対象、入力、出力、失敗時の停止条件を事前に観測できるかを確認する。</dd>
    </dl>
  </li>
</ol>

<style>
.figure-index-list {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
  padding-left: 1.5rem;
}

.figure-index-list > li {
  min-width: 0;
  padding: 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.5rem;
}

.figure-index-list h2 {
  margin-top: 0;
  font-size: 1.1rem;
}

.figure-index-list dl {
  display: grid;
  gap: 0.35rem;
  margin: 0;
}

.figure-index-list dt {
  font-weight: 700;
}

.figure-index-list dd {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>

問題の切り分け手順は、[付録A：トラブルシューティングフロー]({{ '/appendices/troubleshooting/' | relative_url }}) を参照してください。
