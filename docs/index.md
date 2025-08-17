---
layout: book
title: ホーム
order: 1
---

# ITインフラエンジニアのためのソフトウェア基礎知識

## YAML, JSON, スクリプト, APIで学ぶ自動化の基本

### 本書について

ITインフラエンジニアが現代の運用で必須となるソフトウェアの基礎知識を、実践的な視点からコンパクトに解説します。

### 対象読者

- ITインフラの運用・構築に携わっており、自動化やクラウド連携のためにソフトウェアの基礎知識を効率的に習得したいエンジニア
- 設定ファイルの読み書き、スクリプト作成、API連携の基本を短期間で身につけたいインフラ担当者
- 開発者との連携をスムーズにし、DevOpsの考え方を実践したいエンジニア

### 本書で学べること

- YAML, JSONといった主要なデータ記述言語の構造と読み書き
- 設定ファイルやデータ交換における各種ファイル形式の使い分け
- Pythonやシェルスクリプトを使った基本的な自動化スクリプトの作成
- RESTful APIの概念と、APIを使ったクラウドサービスやツールの操作方法
- Gitによる設定ファイルのバージョン管理の基本
- ログ解析や文字列処理に役立つ正規表現の基礎

### 章構成

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

## 📄 ライセンス

本書は **Creative Commons BY-NC-SA 4.0** ライセンスで公開されています。  
**🔓 教育・研究・個人学習での利用は自由** ですが、**💼 商用利用には事前許諾** が必要です。

📋 [詳細なライセンス条件](https://github.com/itdojp/it-engineer-knowledge-architecture/blob/main/LICENSE.md)

**お問い合わせ**  
株式会社アイティードゥ（ITDO Inc.）  
Email: [knowledge@itdo.jp](mailto:knowledge@itdo.jp)

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