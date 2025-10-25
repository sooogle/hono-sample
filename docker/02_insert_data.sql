-- honodbデータベースにサンプルデータを投入（開発用のみ）
\c honodb

-- サンプルTODOデータの投入
INSERT INTO todos (title, description, completed) VALUES
  ('Honoアプリのセットアップ', 'HonoでREST APIを構築する', true),
  ('データベース接続の実装', 'PostgreSQLとの接続を確立する', false),
  ('CRUD APIの実装', 'TODO の作成・取得・更新・削除APIを実装', false),
  ('エラーハンドリングの追加', '適切なエラーレスポンスを返す', false),
  ('バリデーションの実装', '入力値の検証を行う', false);

-- honodb_testデータベースにはサンプルデータを投入しない（テストが自分でデータを作成する）
