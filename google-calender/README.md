# Notion API x Google calendar API

## 概要
GoogleカレンダーをNotionに同期するスクリプト

Googleカレンダー上の新規作成・更新・削除が  
Notionのデータベースに同期される

## 環境
- TypescriptでNotion API・Google calendar APIを使用して開発
- Webpackを使ってGAS上で実行可能な状態にコンパイル
- ClaspでApp Scriptへデプロイ
- 発火はGASのトリガーを用いる, 初期実行系は手動で

**環境構築**  
https://github.com/minako-ph/clasp-ts-template

## Usage

// todo...

### memo
- build
    - `yarn build`
- GASへ反映
    - `yarn deploy`
- main関数をローカルから実行
    - `yarn run:main`