# Legal third-party mall data

This project now includes a legal data generator script:

- Script: `C:\Users\90538\Desktop\webmarket\db\build-legal-seed.mjs`
- Output SQL: `C:\Users\90538\Desktop\webmarket\db\legal-thirdparty-seed.sql`

## Data sources

- Products/users/comments: `https://dummyjson.com` (open sample APIs)

## Generate SQL

```bash
node C:\Users\90538\Desktop\webmarket\db\build-legal-seed.mjs
```

## Import SQL

```bash
mysql -uroot -p springcloudk02l8 < C:\Users\90538\Desktop\webmarket\db\legal-thirdparty-seed.sql
```

## Notes

- This avoids scraping/copying Taobao or other restricted marketplaces.
- Frontend keeps reading from your existing backend APIs.
- Generated user password defaults to `123456` (for demo only).
