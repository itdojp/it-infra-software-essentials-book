---
layout: book
title: "ITインフラエンジニアのためのソフトウェア基礎知識"
order: 1
---

# ITインフラエンジニアのためのソフトウェア基礎知識

## YAML, JSON, スクリプト, APIで学ぶ自動化の基本

### 概要

ITインフラエンジニアが現代の運用で必須となるソフトウェアの基礎知識を、実践的な視点からコンパクトに解説します。

### 想定読者

- ITインフラの運用・構築に携わっており、自動化やクラウド連携のためにソフトウェアの基礎知識を効率的に習得したいエンジニア
- 設定ファイルの読み書き、スクリプト作成、API連携の基本を短期間で身につけたいインフラ担当者
- 開発者との連携をスムーズにし、DevOpsの考え方を実践したいエンジニア

## 学習成果

- YAML, JSON といった主要なデータ記述言語の構造を理解し、設定ファイルやデータ交換で適切に読み書きできるようになる。
- Python やシェルスクリプトを用いて、日常的な運用作業を自動化するための基本的なスクリプトが書けるようになる。
- RESTful API の概念を理解し、クラウドサービスや各種ツールの API を用いた連携・操作のイメージを持てるようになる。
- Git による設定ファイルのバージョン管理や、ログ解析・文字列処理に役立つ正規表現の基礎を身につけ、インフラ運用の効率化に活かせるようになる。

## 読み方ガイド

- まず全体像を掴みたい読者は、第1章から順番に読み進めることで、データ記述言語→スクリプト→API→バージョン管理という流れで基礎を一通り押さえることを推奨する。
- すでにスクリプトには慣れており、設定ファイルやデータ形式に課題を感じている読者は、YAML/JSON などの章を優先的に読み、必要に応じてスクリプト関連の章に戻る読み方も有効である。
- API 連携やクラウドサービスとの統合に関心が高い読者は、API 関連の章を中心に読み、前提となるデータ形式や認証まわりを必要に応じて参照するパターンも選べる。
- 実務で必要な箇所だけをピックアップしたい読者は、章構成一覧から関心の高いトピックを選びつつ、付録や例をリファレンスとして併用する使い方を想定している。

## 目次

<div class="chapter-list">
{% for chapter in site.data.navigation.chapters %}
<div class="chapter-item">
    <h3><a href="{{ chapter.url | relative_url }}">{{ chapter.title }}</a></h3>
</div>
{% endfor %}
</div>

### 著者について

**ITDO Inc.（株式会社アイティードゥ）**

ITインフラの設計・構築・運用を専門とする技術者集団。クラウドネイティブアーキテクチャの実装から、オンプレミスシステムのモダナイゼーションまで、幅広い分野で豊富な実績を持つ。

## 前提知識
- Linux の基本操作（ターミナル、テキスト編集）
- YAML/JSON など設定ファイルを読む機会（インフラ運用・構築の文脈）
- HTTP と API の基礎概念（リクエスト/レスポンス、認証の概要）
- （推奨）簡単なスクリプト作成経験（シェル/Python 等）

## 所要時間
- 通読: 約1.5〜2時間（本文量ベース概算。コードブロック除外、400〜600文字/分換算）
- 章末のサンプルを手元で試す場合は、環境と習熟度により変動します。

## ライセンス

本書は **Creative Commons BY-NC-SA 4.0** ライセンスで公開されています。  
**🔓 教育・研究・個人学習での利用は自由** ですが、**💼 商用利用には事前許諾** が必要です。

📋 [詳細なライセンス条件](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)

**お問い合わせ**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)

---

**著者:** 株式会社アイティードゥ  
**バージョン:** 1.0.1  
**最終更新:** 2026-02-20

<style>
.chapter-list {
    margin: 2rem 0;
}

.chapter-item {
    background-color: #f8f9fa;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    transition: all 0.2s;
}

.chapter-item:hover {
    background-color: #e9ecef;
    transform: translateX(5px);
}

.chapter-item h3 {
    margin: 0;
    font-size: 1.1rem;
}

.chapter-item a {
    color: #2c3e50;
    text-decoration: none;
}

.chapter-item a:hover {
    color: #34495e;
}
</style>
{% include page-navigation.html %}
