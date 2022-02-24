# HD Wallet + QR Generator

For merchants to customer-specific Dash payment addresses from a single mnemonic passphrase.

```bash
npm ci --only=production
```

```bash
node ./bin/mnemonic.js
```

`.env`:

```bash
BASE2048_PASSPHRASE="front vivid salmon donor glory fault picnic chunk casino dial only kind"
```

```bash
node hd-wallet-generator.js
```

```bash
open index.html
```
