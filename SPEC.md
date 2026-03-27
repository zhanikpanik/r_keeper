# r_keeper Clone — Design Spec

## Test Environment
- **Target**: Landscape tablet (POS kiosk)
- **Test method**: Browser via `npx expo start --web`
- **Known viewport**: ~1555×1292 (browser-reported, with Windows scaling)
- **Design reference**: `refs/` folder

## Screens

### 1. Orders Screen (`OrdersScreen.tsx`)
- **Status**: ✅ In progress
- **Reference**: `refs/orders.png`, `refs/zone 1-4.png`
- **Layout**: Header (44px) + 4×5 grid + Bottom tab bar
- **Grid rules**:
  - Cell [0,0] = "Новый заказ" + "Быстрый чек" (split in half)
  - Cells 1–19 = order cards
  - If >19 orders → last cell = pagination (^/v split in half)
  - All cells equal size, flex-based (no fixed px)
- **Card colors**: Green=active, Red=alert, Gray=inactive
- **Bottom bar**: ≡ | Заказы (purple active) | Столы | 🔒

### 2. POS Screen (`PosScreen.tsx`)
- **Status**: 🔲 Needs work
- **Reference**: `refs/order_creation.png`, `refs/{CF291D0A...}.png`, `refs/{ABCE095C...}.png`
- **Layout**: 3-column (35% order / 25% actions / 40% products)
- **Modes**:
  - Default: Category menu + Product grid
  - Modifier: Modifier grid (when item selected)
  - Search: Keyboard + filtered results

## Done
- [x] Auto-save: every mutation syncs to orders[] immediately
- [x] Footer: Пречек | Оплата | Скидки | Ввести код | Готово (columns match content above)
- [x] Footer: item selected → Отмена + Готово
- [x] OrderPanel: scroll via up/down buttons (disabled when nothing to scroll)
- [x] OrderPanel: static "Все гости" header (removed nav arrows)
- [x] Dynamic grid rows based on screen height (2–5 rows)
- [x] Quantity numpad matching reference design

## TODO
- [ ] Orders screen: pixel-perfect polish
- [ ] POS screen: category menu (2-col grid, not bar)
- [ ] POS screen: product grid with colored cards + prices
- [ ] POS screen: search with Russian keyboard
- [ ] POS header: order settings menu (⋮) — change table, waiter, type, add comment, merge/split order
- [ ] Tables screen: grid view
- [ ] Bell button: notifications (kitchen ready, alerts)

### Later
- [ ] Комментарий — add note to a dish
- [ ] Скидка — discount on specific item
- [ ] Guest feature (По гостям, + Гость, Курс)
