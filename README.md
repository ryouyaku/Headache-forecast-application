# 頭痛予報 (Headache Forecast)

頭痛予報は、気象データに基づいて頭痛リスクを予測し、LINEで共有できるLIFFアプリケーションです。

## 機能

- 日本の都道府県と市区町村を選択して天気情報を取得
- 気圧と天気状況から頭痛リスクを計算
- 現在の天気、今日と明日の予報を表示
- 頭痛リスクレベルと対策アドバイスを提供
- LINEチャットにフレックスメッセージとして結果を送信

## 技術スタック

- **フロントエンド**: HTML, CSS (Tailwind CSS), JavaScript
- **バックエンド**: Cloudflare Workers
- **API**: OpenWeatherMap API
- **統合**: LINE LIFF SDK
- **デプロイ**: GitHub Pages, GitHub Actions

## セットアップ手順

### 前提条件

- [GitHub](https://github.com/) アカウント
- [Cloudflare](https://www.cloudflare.com/) アカウント
- [OpenWeatherMap](https://openweathermap.org/) API キー
- [LINE Developers](https://developers.line.biz/) アカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/headache-forecast.git
cd headache-forecast
```

### 2. LINE LIFF アプリケーションの作成

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
2. 新しいプロバイダーを作成（既存のものがあれば不要）
3. 新しいチャンネルを作成（タイプ: LIFFアプリ）
4. LIFFタブでLIFFアプリを追加
   - サイズ: Full
   - エンドポイントURL: `https://your-username.github.io/headache-forecast/`
   - スコープ: chat_message.write を選択
   - ボットリンク機能: ON（任意）
5. 作成したLIFF IDをコピー

### 3. フロントエンドの設定

1. `src/js/liff.js` ファイルを開く
2. LIFF_ID を先ほどコピーしたIDに変更:
   ```javascript
   const LIFF_ID = "your-liff-id-here";
   ```
3. `src/js/app.js` ファイルを開く
4. API_ENDPOINT をCloudflare Workerのエンドポイントに変更:
   ```javascript
   const API_ENDPOINT = 'https://headache-forecast.your-username.workers.dev';
   ```

### 4. Cloudflare Workerのデプロイ

1. [Cloudflare Workers](https://workers.cloudflare.com/) にログイン
2. Cloudflare Workers CLI (Wrangler)をインストール:
   ```bash
   npm install -g wrangler
   ```
3. Wranglerで認証:
   ```bash
   wrangler login
   ```
4. ディレクトリ移動:
   ```bash
   cd workers
   ```
5. OpenWeatherMap APIキーをシークレットとして追加:
   ```bash
   wrangler secret put WEATHER_API_KEY
   # プロンプトが表示されたらAPIキーを入力
   ```
6. Workerをデプロイ:
   ```bash
   wrangler publish
   ```
7. 表示されたエンドポイントURLをメモ

### 5. GitHub Pagesでのデプロイ

1. GitHub リポジトリにプッシュ:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. GitHub リポジトリの Settings > Pages を開く
3. ソースとして "GitHub Actions" を選択
4. 自動的にデプロイが開始され、数分後に公開される

### 6. アプリのテスト

1. LINEアプリで自分自身にメッセージを送信
2. そのメッセージに以下のリンクを含める:
   ```
   https://liff.line.me/your-liff-id-here
   ```
3. リンクをタップしてアプリを開く
4. 都道府県と市区町村を選択し「予報を見る」をタップ
5. 表示された結果を「チャットに送信する」をタップして共有

## プロジェクト構造

```
headache-forecast/
├── README.md                 # プロジェクトドキュメント
├── .github/                  # GitHub Actions設定
│   └── workflows/
│       └── deploy.yml        # GitHub Pagesデプロイワークフロー
├── public/                   # 静的ファイル
│   ├── favicon.ico           # サイトファビコン
│   ├── images/               # 画像リソース
│   └── manifest.json         # PWAマニフェスト
├── src/                      # ソースコード
│   ├── index.html            # メインHTMLファイル
│   ├── css/                  # スタイルシート
│   │   └── style.css         # カスタムスタイル
│   ├── js/                   # JavaScriptファイル
│   │   ├── app.js            # メインアプリケーションロジック
│   │   ├── liff.js           # LINE LIFF統合
│   │   ├── weather.js        # 天気データ取得
│   │   ├── headache.js       # 頭痛リスク計算
│   │   └── prefectures.js    # 都道府県データ
└── workers/                  # Cloudflare Workers
    ├── wrangler.toml         # Cloudflare設定
    └── index.js              # APIプロキシスクリプト
```

## カスタマイズ

- `src/css/style.css`: UIスタイルをカスタマイズ
- `src/js/headache.js`: 頭痛リスク計算ロジックを調整
- `workers/index.js`: APIプロキシのロジックを変更

## トラブルシューティング

- **「天気データの取得に失敗しました」エラー**: OpenWeatherMap APIキーが正しく設定されているか確認
- **「LIFF初期化に失敗しました」エラー**: LIFF IDが正しいか確認し、エンドポイントURLがLIFF設定と一致していることを確認
- **Cloudflare Workerがデプロイできない**: Wranglerが正しくインストールされ認証されているか確認

## ライセンス

MIT License

## クレジット

- 天気データ: [OpenWeatherMap](https://openweathermap.org/)
- UI Framework: [Tailwind CSS](https://tailwindcss.com/)
- フロントエンドフレームワーク: [LINE LIFF SDK](https://developers.line.biz/en/docs/liff/overview/)