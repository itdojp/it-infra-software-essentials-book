# ITインフラエンジニアのためのソフトウェア基礎知識

> **YAML, JSON, スクリプト, APIで学ぶ自動化の基本**

[![Book Format](https://img.shields.io/badge/Format-ITDO%20book--formatter%20v3.0-blue.svg)](https://github.com/itdojp/book-formatter)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)](book-config.yaml)

## 📚 概要

本書は、ITインフラエンジニアが現代の運用で必須となるソフトウェアの基礎知識を、実践的な視点からコンパクトに解説する技術書です。ITDO book-formatter v3.0の標準構造に準拠して作成されており、効率的な学習体験を提供します。

## 🎯 対象読者

- ITインフラの運用・構築に携わっており、自動化やクラウド連携のためにソフトウェアの基礎知識を効率的に習得したいエンジニア
- 設定ファイルの読み書き、スクリプト作成、API連携の基本を短期間で身につけたいインフラ担当者
- 開発者との連携をスムーズにし、DevOpsの考え方を実践したいエンジニア

## ⏱️ 学習時間目安

**約4-6時間**（読み進めながら実際に手を動かす場合）

## 📖 章構成

1. **インフラエンジニアとソフトウェアの接点**
   - なぜインフラエンジニアにソフトウェア知識が必要か
   - 自動化、IaC、クラウドネイティブ、DevOps、SREの実践

2. **データ記述言語の基本と実践**
   - YAML、JSON、XML、INI/TOMLの理解と活用
   - 各形式の使い分けと実践的な例

3. **スクリプト言語による自動化の初歩**
   - Bashシェルスクリプトの基本
   - Pythonによる自動化スクリプト作成

4. **APIによるインフラ連携**
   - RESTful APIの基本概念
   - クラウドサービスとの連携実装

5. **インフラ運用を支えるその他のソフトウェア知識**
   - Gitによるバージョン管理
   - 正規表現、環境変数、パッケージ管理

## 🚀 本書で学べること

- YAML, JSONといった主要なデータ記述言語の構造と読み書き
- 設定ファイルやデータ交換における各種ファイル形式の使い分け
- Pythonやシェルスクリプトを使った基本的な自動化スクリプトの作成
- RESTful APIの概念と、APIを使ったクラウドサービスやツールの操作方法
- Gitによる設定ファイルのバージョン管理の基本
- ログ解析や文字列処理に役立つ正規表現の基礎

## 🛠️ 開発環境のセットアップ

### 前提条件

- Ruby 2.7+
- Bundler
- Node.js 14+ (オプション)

### ローカル環境での開発

```bash
# リポジトリのクローン
git clone https://github.com/itdojp/it-infra-software-essentials-book.git
cd it-infra-software-essentials-book

# 依存関係のインストール
bundle install

# ローカルサーバーの起動
bundle exec jekyll serve --baseurl ""

# ブラウザで http://localhost:4000 にアクセス
```

### Dockerを使用した開発

```bash
# Dockerコンテナの起動
docker-compose up

# ブラウザで http://localhost:4000 にアクセス
```

### 書籍の構造

```
├── book-config.yaml          # 書籍設定（ITDO book-formatter準拠）
├── _config.yml              # Jekyll設定
├── index.md                 # 書籍のホームページ
├── src/                     # 書籍のソースファイル
│   ├── chapters/           # 章ごとのディレクトリ
│   │   ├── chapter01/      
│   │   │   └── index.md    # 第1章の内容
│   │   └── ...
│   └── appendices/         # 付録
├── assets/                  # 画像、CSS、JavaScript
├── templates/               # レイアウトテンプレート
└── _layouts/               # Jekyll レイアウト
```

## 📝 ライセンス

Copyright (c) 2025 ITDO Inc. All rights reserved.

## 👥 著者

**ITDO Inc.（株式会社アイティードゥ）**

ITインフラの設計・構築・運用を専門とする技術者集団。クラウドネイティブアーキテクチャの実装から、オンプレミスシステムのモダナイゼーションまで、幅広い分野で豊富な実績を持つ。

## 📧 お問い合わせ

- Email: knowledge@itdo.jp
- GitHub: [@itdojp](https://github.com/itdojp)
