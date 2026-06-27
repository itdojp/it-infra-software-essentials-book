---
layout: chapter
title: 第2章：データ記述言語の基本と実践
chapter: 2
---

# 第2章：データ記述言語の基本と実践

現代のインフラ運用において、設定ファイルや API 通信のデータは、人間にとっても機械にとっても理解しやすい形式で記述されている必要があります。その中心となるのが、**JSON** (JavaScript Object Notation) と**YAML** (YAML Ain't Markup Language) です。これらのデータ記述言語は、インフラの自動化、クラウドサービスの設定、コンテナオーケストレーションなど、多岐にわたる場面で活用されています。

この章では、JSON と YAML の基本的な構造、記述ルール、そして Python を使ったデータの読み書き方法を学びます。さらに、それぞれの言語がどのような場面で使われるのか、その利用シーンについても掘り下げていきます。

![データ記述言語の全体像]({{ '/assets/images/diagrams/chapter02/data-description-languages-overview.svg' | relative_url }})

## **2.1 JSON（JavaScript Object Notation）**

JSON は、軽量なデータ交換フォーマットとして広く利用されています。JavaScript のオブジェクト表記法をベースにしており、人間が読みやすく、機械が解析しやすいという特徴を持っています。Web API のレスポンスやリクエストボディ、各種設定ファイルなどで頻繁に利用されます。

### **構造（オブジェクト、配列、データ型）と記述ルール**

JSON は、主に以下の2つの構造と、いくつかの基本的なデータ型で構成されます。

* **オブジェクト（{}）とキーバリューペア**:
  * 順序を持たないキーと値のペアの集まりです。キーは文字列で、値は任意の JSON データ型（文字列、数値、真偽値、null、オブジェクト、配列）を取ります。
  * キーと値はコロン（:）で区切られ、各キーバリューペアはカンマ（,）で区切られます。
  * **例**: {"name": "Alice", "age": 30}
* **配列（[]）と要素のリスト**:
  * 順序を持つ値のリストです。各要素は任意の JSON データ型を取ります。
  * 各要素はカンマ（,）で区切られます。
  * **例**: ["apple", "banana", "cherry"]
* **文字列、数値、真偽値、null などのデータ型**:
  * **文字列 (String)**: ダブルクォーテーション（""）で囲まれた Unicode 文字のシーケンス。例: "Hello, World!"
  * **数値 (Number)**: 整数または浮動小数点数。例: 123, 3.14
  * **真偽値 (Boolean)**: true または false。
  * **null**: 値がないことを表す。
* **ネストされた構造の記述方法**:
  * オブジェクトや配列の中に、さらにオブジェクトや配列を記述することで、複雑な階層構造を表現できます。

```json
{
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "roles": ["admin", "editor"],
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "zipCode": "12345"
    }
  },
  "isActive": true
}
```

この例では、user オブジェクトの中にさらに address オブジェクトと roles 配列がネストされています。このように、JSON は柔軟にデータを構造化できるため、様々な情報を表現するのに適しています。

### **Python での JSON データの読み書き、簡単な操作**

Python は標準ライブラリで JSON をサポートしており、非常に簡単に JSON データを扱うことができます。json モジュールを使用します。

* **json モジュール（json.load(), json.loads(), json.dump(), json.dumps()）**:
  * json.loads(): JSON 形式の文字列を Python のオブジェクト（辞書やリスト）に変換します（"load string"）。
  * json.dumps(): Python のオブジェクトを JSON 形式の文字列に変換します（"dump string"）。
  * json.load(): ファイルオブジェクトから JSON データを読み込み、Python のオブジェクトに変換します。
  * json.dump(): Python のオブジェクトを JSON 形式でファイルに書き込みます。

```python
import json
import os

# JSON 文字列から Python オブジェクトへ変換 (loads)
json_string = '{"name": "Alice", "age": 30, "city": "New York"}'
try:
    data = json.loads(json_string)
    # 型チェック: データが辞書型であることを確認
    if not isinstance(data, dict):
        raise ValueError("JSON データは辞書型である必要があります")
    # 必要なキーの存在チェック
    required_keys = ["name", "age"]
    for key in required_keys:
        if key not in data:
            raise KeyError(f"必須キー '{key}' が見つかりません")
    print(f"Python オブジェクト: {data}")
    print(f"名前: {data['name']}, 年齢: {data['age']}")
except json.JSONDecodeError as e:
    print(f"JSON パースエラー: {e}")
except (KeyError, ValueError) as e:
    print(f"データ検証エラー: {e}")

# Python オブジェクトから JSON 文字列へ変換 (dumps)
python_dict = {
    "server": "web01",
    "ip_address": "192.168.1.100",
    "services": ["http", "ssh"],
    "config_version": 1.0
}
json_output = json.dumps(python_dict, indent=2, ensure_ascii=False) # indent で整形, ensure_ascii=False で日本語もそのまま出力
print(f"\nJSON 文字列:\n{json_output}")

# ファイルからの読み込み (load)
# まずはファイルを作成
file_path_config = "config.json"
try:
    # ファイルパスの検証
    if not file_path_config or '..' in file_path_config:
        raise ValueError("不正なファイルパスが指定されました")

    with open(file_path_config, "w", encoding="utf-8") as f:
        json.dump({"database": "mydb", "port": 5432, "environment": "production"}, f, indent=2, ensure_ascii=False)
    print(f"\n'{file_path_config}' を作成しました。")
except (OSError, IOError) as e:
    print(f"ファイル作成エラー: {e}")
except ValueError as e:
    print(f"パス検証エラー: {e}")

try:
    with open(file_path_config, "r", encoding="utf-8") as f:
        config_data = json.load(f)
    print(f"'{file_path_config}' から読み込んだデータ: {config_data}")
except FileNotFoundError:
    print(f"エラー: '{file_path_config}' が見つかりません。")
except json.JSONDecodeError:
    print(f"エラー: '{file_path_config}' の JSON 形式が不正です。")

# ファイルへの書き込み (dump)
file_path_users = "users.json"
new_data = {"user_list": [{"id": 1, "name": "Bob"}, {"id": 2, "name": "Charlie", "status": "active"}]}
try:
    # ファイルパスの検証
    if not file_path_users or '..' in file_path_users:
        raise ValueError("不正なファイルパスが指定されました")

    # データの検証
    if not isinstance(new_data, dict):
        raise ValueError("書き込むデータは辞書型である必要があります")

    with open(file_path_users, "w", encoding="utf-8") as f:
        json.dump(new_data, f, indent=2, ensure_ascii=False)
    print(f"'{file_path_users}' にデータを書き込みました。")
except (OSError, IOError) as e:
    print(f"ファイル書き込みエラー: {e}")
except ValueError as e:
    print(f"データ検証エラー: {e}")

# クリーンアップ (実行環境によっては不要)
# if os.path.exists(file_path_config):
#     os.remove(file_path_config)
# if os.path.exists(file_path_users):
#     os.remove(file_path_users)
```

`indent` 引数を使用すると、出力される JSON 文字列を整形して読みやすくすることができます。`ensure_ascii=False` は、日本語などの非 ASCII 文字をエスケープせずにそのまま出力するために重要です。また、ファイル操作時には`encoding="utf-8"`を指定することで文字化けを防ぎます。

* **Python の辞書・リストと JSON の対応関係**:
  * JSON のオブジェクトは Python の辞書（dict）に対応します。
  * JSON の配列は Python のリスト（list）に対応します。
  * JSON の文字列、数値、真偽値、null は、Python の文字列（str）、数値（int, float）、真偽値（True, False）、None に対応します。この直接的な対応関係が、Python で JSON を扱いやすくしている大きな理由です。
* **JSON データの特定の要素へのアクセスと変更**:
  * Python の辞書やリストとして扱えるため、通常の Python の操作（キー指定、インデックス指定）で要素にアクセスしたり、値を変更したりできます。

```python
import json

json_string = '{"server": {"name": "app01", "status": "running", "tags": ["backend", "production"]}, "metrics": [10, 20, 30]}'
try:
    data = json.loads(json_string)
    # 型とキーの検証
    if not isinstance(data, dict):
        raise ValueError("JSON データは辞書型である必要があります")
    if 'server' not in data or not isinstance(data['server'], dict):
        raise KeyError("'server' キーが見つからないか、辞書型ではありません")
    if 'name' not in data['server']:
        raise KeyError("'server.name' キーが見つかりません")

    print(f"サーバー名: {data['server']['name']}") # ネストされた要素へのアクセス
except json.JSONDecodeError as e:
    print(f"JSON パースエラー: {e}")
except (KeyError, ValueError) as e:
    print(f"データ検証エラー: {e}")
    # エラーが発生した場合はスクリプトを続行しない
    exit(1)

# 値の変更
data['server']['status'] = 'stopped'
print(f"変更後のステータス: {data['server']['status']}")

# リストへの要素追加
data['metrics'].append(40)
print(f"変更後のメトリクス: {data['metrics']}")

# 新しいキーの追加
data['server']['region'] = 'us-east-1'
print(f"新しいキー追加後: {data['server']}")

print(f"\n変更後のデータ全体:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
```

辞書やリストの操作に慣れていれば、JSON データの操作も直感的に行えます。

### **利用シーン**

* **Web API のレスポンス/リクエストボディ**:
  * RESTful API では、クライアントとサーバー間のデータ交換に JSON がデファクトスタンダードとして使われます。例えば、クラウドプロバイダーの API（AWS EC2 API、Azure REST API など）は、ほとんどが JSON 形式でデータを返します。
  * API を介して仮想マシンの状態を取得したり、新しいリソースを作成したりする際に、JSON 形式のデータを送受信します。
* **設定ファイル（例: package.json, tsconfig.json）**:
  * JavaScript/Node.js エコシステムでは、プロジェクトの設定、依存関係の管理、ビルドスクリプトの定義などに JSON が広く使われます。
  * 一部のアプリケーションやツールの設定ファイルとしても、そのシンプルさから JSON が採用されています。
* **ログデータ、データ交換フォーマット**:
  * 構造化されたログを出力する際に JSON 形式が使われることがあります。これにより、ログ解析ツール（例: Elasticsearch, Splunk）での処理や検索が容易になります。
  * 異なるシステム間（例: マイクロサービス間）でデータをやり取りする際の汎用的なフォーマットとしても利用され、相互運用性を高めます。

## **2.2 YAML（YAML Ain't Markup Language）**

YAML は「YAML はマークアップ言語ではない (YAML Ain't Markup Language)」という再帰的頭字語が示す通り、データ構造を表現するための人間が読みやすい言語として設計されています。設定ファイルやマニフェストファイルで特に人気があり、JSON よりも簡潔に記述できることが多いのが特徴です。その可読性の高さから、IaC ツールやコンテナオーケストレーションの設定で広く採用されています。

### **構造（マッピング、シーケンス）と記述ルール**

YAML も JSON と同様に、主にマッピング（オブジェクト）とシーケンス（配列）で構成されますが、その記述方法に大きな違いがあります。

* **マッピング（キーバリューペア）の記述（インデントの重要性）**:
  * キーと値はコロン（:）で区切られます。
  * **インデント（字下げ）**によって階層構造を表現するのが最大の特徴です。スペース2つまたは4つを使うのが一般的ですが、タブは推奨されません。インデントが正しくないと、YAML パーサーはエラーを発生させます。

```yaml
# YAML の例：サーバー設定
server:
  name: webserver01
  ip_address: 192.168.1.10
  ports:
    - 80
    - 443
  enabled: true
  description: "これは Web サーバーの設定です。"
```

* **シーケンス（リスト）の記述（ハイフン-）**:
  * 各要素はハイフンとスペース（- ）で始まります。
  * インデントによってネストされたリストも表現できます。

```yaml
# YAML の例：ユーザーリスト
users:
  - name: Alice
    role: admin
    email: alice@example.com
  - name: Bob
    role: guest
    email: bob@example.com
```

* **スカラー（文字列、数値など）の記述**:
  * 文字列は通常クォーテーションなしで記述できますが、特殊文字（例: :、#、[、{など）を含む場合や、数字と区別したい場合（例: 123を文字列として扱いたい場合）はシングルクォーテーション（''）またはダブルクォーテーション（""）で囲みます。
  * 数値、真偽値（原則 `true/false`。`yes/no` は実装・バージョン差があり誤解を招くため避ける）、null（null, ~）はそのまま記述します。
* **複数行文字列（|, >）の扱い**:
  * 長い文字列を複数行にわたって記述する際に便利です。
  * **リテラルスタイル（|）**: 改行を含めてそのままの文字列として扱います。スクリプトやメッセージなど、改行が重要な場合に便利です。
    ```yaml
    message: |
      これは
      複数行の
      メッセージです。
      改行が保持されます。
    ```

  * **折り畳みスタイル（>）**: 改行をスペースに変換し、長い行を折り畳んで表現します。最終的な文字列は単一の行になります。
    ```yaml
    description: >
      これは非常に長い説明文です。
      複数の行にわたって記述できますが、
      最終的には単一の行として扱われます。
    ```

### **JSON との比較、可読性の高さ**

* **JSON との互換性（YAML は JSON のスーパーセット）**:
  * YAML は JSON のスーパーセットであり、ほとんどの JSON ファイルは有効な YAML ファイルでもあります。これは、JSON で記述された設定を YAML に変換しやすいことを意味します。
  * ただし、YAML には JSON にはない機能（コメント、アンカー、エイリアス、タグなど）があります。
* **人間が読み書きしやすい理由**:
  * 冗長な記号（{, }, [, ], "）が少ないため、インデントによる構造が視覚的に分かりやすく、クリーンな印象を与えます。
  * コメント（#）を記述できるため、設定の意図や背景を明記しやすく、チームでの共同作業やメンテナンス性が向上します。
* **コメントの記述方法**:
  * #記号以降がコメントとして扱われます。行頭でも行末でも記述可能です。

### **Python での YAML データの読み書き、簡単な操作**

Python で YAML データを扱うには、PyYAML などの外部ライブラリをインストールする必要があります。

* **PyYAML ライブラリの導入と使い方（yaml.safe_load(), yaml.dump()）**:
  * インストール: pip install PyYAML
  * yaml.safe_load(): YAML 形式の文字列やファイルから Python オブジェクトに変換します。セキュリティ上の理由から、任意の Python オブジェクトを生成する可能性があるload() ではなく、安全な safe_load() の使用が推奨されます。
  * yaml.dump(): Python オブジェクトを YAML 形式の文字列やファイルに変換します。

```python
import yaml
import os

# YAML 文字列から Python オブジェクトへ変換 (safe_load)
yaml_string = """
database:
  type: postgresql
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: mysecretpassword
"""
try:
    config = yaml.safe_load(yaml_string)
    # 型とキーの検証
    if not isinstance(config, dict):
        raise ValueError("YAML データは辞書型である必要があります")
    if 'database' not in config or not isinstance(config['database'], dict):
        raise KeyError("'database' キーが見つからないか、辞書型ではありません")

    required_keys = ['type', 'host', 'port']
    for key in required_keys:
        if key not in config['database']:
            raise KeyError(f"必須キー 'database.{key}' が見つかりません")

    print(f"Python オブジェクト: {config}")
    print(f"DB タイプ: {config['database']['type']}")
    print(f"DB ホスト: {config['database']['host']}")
except yaml.YAMLError as e:
    print(f"YAML パースエラー: {e}")
except (KeyError, ValueError) as e:
    print(f"データ検証エラー: {e}")

# Python オブジェクトから YAML 文字列へ変換 (dump)
infra_settings = {
    "webservers": [
        {"name": "web01", "ip": "10.0.0.1", "role": "frontend"},
        {"name": "web02", "ip": "10.0.0.2", "role": "frontend"}
    ],
    "database_server": {
        "name": "db01",
        "ip": "10.0.0.10",
        "version": "14.5",
        "status": "running"
    }
}
# sort_keys=False で元の順序を維持し、indent で整形
yaml_output = yaml.dump(infra_settings, sort_keys=False, indent=2, allow_unicode=True)
print(f"\nYAML 文字列:\n{yaml_output}")

# ファイルからの読み込みと書き込み
file_path_settings = "settings.yaml"
try:
    # ファイルパスの検証
    if not file_path_settings or '..' in file_path_settings:
        raise ValueError("不正なファイルパスが指定されました")

    # データの検証
    if not isinstance(infra_settings, dict):
        raise ValueError("書き込むデータは辞書型である必要があります")

    with open(file_path_settings, "w", encoding="utf-8") as f:
        yaml.dump(infra_settings, f, sort_keys=False, indent=2, allow_unicode=True)
    print(f"\n'{file_path_settings}' を作成しました。")
except (OSError, IOError) as e:
    print(f"ファイル書き込みエラー: {e}")
except ValueError as e:
    print(f"データ検証エラー: {e}")

try:
    with open(file_path_settings, "r", encoding="utf-8") as f:
        loaded_settings = yaml.safe_load(f)
    print(f"'{file_path_settings}' から読み込んだ設定: {loaded_settings}")
except FileNotFoundError:
    print(f"エラー: '{file_path_settings}' が見つかりません。")
except yaml.YAMLError:
    print(f"エラー: '{file_path_settings}' の YAML 形式が不正です。")

# クリーンアップ (実行環境によっては不要)
# if os.path.exists(file_path_settings):
#     os.remove(file_path_settings)
```

`allow_unicode=True`は、日本語などの Unicode 文字をエスケープせずに YAML に出力するために必要です。

* **Python の辞書・リストと YAML の対応関係**:
  * YAML のマッピングは Python の辞書（dict）に対応します。
  * YAML のシーケンスは Python のリスト（list）に対応します。
  * JSON と同様に、スカラー値は Python の対応するデータ型に変換されます。この一貫性により、JSON と YAML のどちらの形式のデータも Python で同様に操作できます。

### **利用シーン**

* **Kubernetes マニフェストファイル**:
  * Kubernetes の Pod、Deployment、Service、ConfigMap などのリソース定義は、すべて YAML 形式で記述されます。これは、インフラエンジニアが YAML を学ぶ上で最も重要な理由の一つであり、Kubernetes の学習と運用には YAML の深い理解が不可欠です。
* **Ansible Playbook**:
  * 構成管理ツール Ansible の自動化スクリプトである Playbook は YAML で記述されます。サーバーへのソフトウェアインストール、設定変更、サービス起動、ユーザー管理などを YAML で定義し、冪等性（何度実行しても同じ結果になること）を保ちながらインフラを自動化します。
* **Docker Compose ファイル**:
  * 複数の Docker コンテナを連携させてアプリケーションを定義・実行するための Docker Compose ファイルも YAML 形式です。サービス、ネットワーク、ボリュームなどの設定を YAML で記述することで、複雑なコンテナ環境を簡単に起動・管理できます。
* **CI/CD パイプラインの設定ファイル（GitHub Actions, GitLab CI など）**:
  * GitHub Actions のワークフロー定義（.github/workflows/*.yaml）や GitLab CI/CD のパイプライン定義（.gitlab-ci.yml）など、モダンな CI/CD ツールでは YAML が設定ファイルの標準となっています。これにより、ビルド、テスト、デプロイの自動化プロセスをコードとして管理できます。
* **各種アプリケーションやツールの設定ファイル**:
  * 多くの新しいツールやアプリケーションが、人間が読み書きしやすい YAML を設定ファイルとして採用しています。例えば、Prometheus の監視設定、Grafana のダッシュボード定義、Logstash のパイプライン設定など、様々な場面で YAML が使われています。

## **2.3 その他のファイル形式（簡易解説）**

JSON と YAML が現代のインフラ運用で最も重要ですが、他にも知っておくべきデータ記述言語やファイル形式があります。これらは特定の状況やレガシーなシステムで使われることがあります。

### **XML (Extensible Markup Language)**

* **タグベースの階層構造**:
  * HTML に似たタグを使ってデータを表現します。開始タグと終了タグで要素を囲み、属性でメタ情報を付与します。JSON や YAML に比べて冗長になりがちですが、スキーマによる厳密な構造定義が可能です。
  * **例**: <server><name>web01</name><ip address="192.168.1.10"/></server>
* **スキーマ定義（DTD, XML Schema）による厳密な構造化**:
  * XML 文書の構造や内容を厳密に定義するためのスキーマ言語が存在し、これによりデータの整合性を保証できます。これは、異なるシステム間でのデータ交換において、データの形式が保証されるというメリットがあります。
* **利用シーン**:
  * 過去のシステム連携（特に SOAP ベースの Web サービス）。
  * Java EE などのエンタープライズアプリケーションの設定ファイル（例: web.xml）。
  * 仮想マシンの定義ファイル（KVM のドメイン XML など）。
  * Microsoft Office ドキュメント（.docx, .xlsx など）の内部フォーマット。

### **TOML (Tom's Obvious, Minimal Language)**

* **シンプルで人間が読みやすい設定ファイル形式**:
  * YAML よりもさらにシンプルで、JSON よりも人間が書きやすいことを目指して設計されています。
  * [table]や[[array of tables]]といったセクションを使って階層構造を表現します。キーバリューペアが中心で、設定ファイルに特化しています。
  * **例**:
    ```toml
    # TOML の例
    title = "My App Configuration"

    [database]
    type = "postgresql"
    host = "localhost"
    port = 5432
    enabled = true

    [[servers]]
    name = "web01"
    ip = "192.168.1.10"

    [[servers]]
    name = "web02"
    ip = "192.168.1.11"
    ```

* **利用シーン**:
  * Rust プロジェクトの設定ファイル（Cargo.toml）。
  * 一部のモダンなアプリケーション設定や、設定ファイルのシンプルさを重視するプロジェクト。

### **CSV (Comma-Separated Values)**

* **カンマ区切りの表形式データ**:
  * 最もシンプルで汎用的な表形式データの表現方法です。各行がレコードを表し、カンマで区切られた値が各フィールドを表します。
  * **例**:
    ```csv
    Name,Age,City,Role
    Alice,30,New York,admin
    Bob,25,London,guest
    Charlie,35,Tokyo,editor
    ```

* **利用シーン**:
  * 簡易的なデータリスト（サーバーリスト、ユーザーリスト、IP アドレス一覧など）。
  * ログデータのエクスポート、スプレッドシートとの連携。
  * 監視データやレポートの出力。
  * データベースからのデータエクスポート/インポート。
