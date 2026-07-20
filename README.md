# ITインフラエンジニアのためのソフトウェア基礎知識

> **YAML, JSON, スクリプト, API で学ぶ自動化の基本**

[![Book Format](https://img.shields.io/badge/Format-ITDO%20book--formatter%20v3.0-blue.svg)](https://github.com/itdojp/book-formatter)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)
[![Version](https://img.shields.io/badge/Version-1.0.1-orange.svg)](book-config.yaml)

## オンライン版

- GitHub Pages: https://itdojp.github.io/it-infra-software-essentials-book/
- リポジトリ入口: `docs/index.md`

## 📚 概要

本書は、IT インフラエンジニアが現代の運用で必須となるソフトウェアの基礎知識を、実践的な視点からコンパクトに解説する技術書です。ITDO book-formatter v3.0 の標準構造に準拠して作成されており、効率的な学習体験を提供します。

## 🎯 対象読者

- IT インフラの運用・構築に携わっており、自動化やクラウド連携のためにソフトウェアの基礎知識を効率的に習得したいエンジニア
- 設定ファイルの読み書き、スクリプト作成、API 連携の基本を短期間で身につけたいインフラ担当者
- 開発者との連携をスムーズにし、DevOps の考え方を実践したいエンジニア

## ⏱️ 学習時間目安

**約4〜6時間**（読み進めながら実際に手を動かす場合）

## 📖 章構成

1. **インフラエンジニアとソフトウェアの接点**
   - なぜインフラエンジニアにソフトウェア知識が必要か
   - 自動化、IaC、クラウドネイティブ、DevOps、SRE の実践

2. **データ記述言語の基本と実践**
   - JSON、YAML の構造と読み書き
   - XML、TOML、CSV の特徴と使い分け

3. **スクリプト言語による自動化の初歩**
   - Bash シェルスクリプトの基本
   - Python による自動化スクリプト作成

4. **API によるインフラ連携**
   - RESTful API の基本概念
   - クラウドサービスとの連携実装

5. **インフラ運用を支えるその他のソフトウェア知識**
   - Git によるバージョン管理
   - 正規表現によるログ・文字列処理
   - 配列・辞書などのデータ構造

## 🚀 本書で学べること

- YAML, JSON といった主要なデータ記述言語の構造と読み書き
- 設定ファイルやデータ交換における各種ファイル形式の使い分け
- Python やシェルスクリプトを使った基本的な自動化スクリプトの作成
- RESTful API の概念と、API を使ったクラウドサービスやツールの操作方法
- Git による設定ファイルのバージョン管理の基本
- ログ解析や文字列処理に役立つ正規表現の基礎

## 🛠️ 開発環境のセットアップ

### 前提条件

- Ruby 3.2+
- Bundler
- Node.js 20.18.1+（npm によるローカル品質チェックで使用）

### ローカル環境での開発

```bash
# リポジトリのクローン
git clone https://github.com/itdojp/it-infra-software-essentials-book.git
cd it-infra-software-essentials-book

# Node.js 依存関係のインストール
npm ci

# Ruby/Bundler 依存関係のインストール（docs/Gemfile を使用）
npm run install:deps

# ローカルサーバーの起動
npm run dev

# ブラウザで http://localhost:4000 にアクセス
```


### 品質チェック

```bash
# セキュリティ監査
npm run check:security

# メタデータ・ナビゲーション整合性チェック
npm run check:metadata

# ローカル品質チェック（メタデータ、Markdown lint、Prettier、docs sanity）
npm test
```

### Docker を使用した開発

```bash
# Docker コンテナの起動
docker compose up

# ブラウザで http://localhost:4000 にアクセス
```

### 書籍の構造

```text
├── book-config.yaml          # 書籍設定（ITDO book-formatter 準拠）
├── _config.yml              # ルート配置の互換用 Jekyll 設定
├── docs/                    # 公開サイトのソース
│   ├── _config.yml          # GitHub Pages/Jekyll ビルド設定
│   ├── _data/               # 公開サイトのナビゲーション定義
│   ├── index.md             # 書籍のホームページ
│   ├── chapters/            # 章ごとのディレクトリ
│   │   ├── chapter01/
│   │   │   └── index.md     # 第1章の内容
│   │   └── ...
│   ├── assets/              # 画像、CSS、JavaScript
│   └── _layouts/            # Jekyll レイアウト
├── src/                     # book-config.yaml が参照する原稿ソース
│   └── chapters/            # 章ごとの原稿ディレクトリ
└── scripts/                 # ローカル品質チェック/ビルド補助
```

## 📝 ライセンス

本書は **Creative Commons BY-NC-SA 4.0** ライセンスで提供されます。詳細は `LICENSE.md` を参照してください。

## 👥 著者

**ITDO Inc.（株式会社アイティードゥ）**

IT インフラの設計・構築・運用を専門とする技術者集団。クラウドネイティブアーキテクチャの実装から、オンプレミスシステムのモダナイゼーションまで、幅広い分野で豊富な実績を持つ。

## 📧 お問い合わせ

- Email: knowledge@itdo.jp
- GitHub: [@itdojp](https://github.com/itdojp)
