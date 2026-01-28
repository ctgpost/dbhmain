# CustomerLoyalty ত্রুটি সংশোধন - Convex Validation Error

## সমস্যা
```
ArgumentValidationError: Value does not match validator.
Path: .referrerId
Value: "cust3"
Validator: v.id("customers")
```

## কারণ
CustomerLoyalty.tsx কম্পোনেন্ট ভুলভাবে `selectedCustomer.customerId` ব্যবহার করছিল যা একটি সাধারণ স্ট্রিং `"cust3"` ছিল।

Convex স্কিমা `v.id("customers")` প্রত্যাশা করছিল যা একটি বৈধ Convex document ID (`_id`)।

## সমাধান
### পরিবর্তিত ফাইল: `src/components/CustomerLoyalty.tsx`

**আগে:**
```tsx
// লাইন 139
referrerId: selectedCustomer.customerId as any,

// লাইন 168
customerId: selectedCustomer.customerId as any,
```

**পরে:**
```tsx
// লাইন 139
referrerId: selectedCustomer._id,

// লাইন 168
customerId: selectedCustomer._id,
```

### মূল বিষয়সমূহ

1. **_id vs customerId**
   - `_id`: Convex ডকুমেন্ট ID (সত্যিকারের unique identifier)
   - `customerId`: অতিরিক্ত কাস্টম ফিল্ড যা পূর্ববর্তী সিস্টেমের জন্য ছিল

2. **সংজ্ঞা** (CustomerLoyalty.tsx লাইন 120):
   ```tsx
   const selectedCustomer = customers.find((c) => c._id === selectedCustomerId) || customers[0];
   ```
   এটি `_id` দিয়ে ম্যাচ করে, তাই `_id` পাস করা উচিত

3. **Convex স্কিমা** (convex/loyalty.ts লাইন 513-515):
   ```typescript
   args: {
     referrerId: v.id("customers"),  // ← v.id("customers") নির্দিষ্ট করে _id আশা করা হয়
   }
   ```

## প্রভাবিত Mutations

### 1. createReferral
- **লোকেশন**: convex/loyalty.ts, লাইন 513
- **প্যারামিটার**: `referrerId: v.id("customers")`
- **কল**: CustomerLoyalty.tsx, লাইন 131-147

### 2. redeemPoints
- **লোকেশন**: convex/loyalty.ts, লাইন 193
- **প্যারামিটার**: `customerId: v.id("customers")`
- **কল**: CustomerLoyalty.tsx, লাইন 157-174

## পরীক্ষা করা আইটেম

✅ **Referral তৈরি করা**
- সঠিক customer _id পাঠানো হচ্ছে
- Convex validation পাস করছে

✅ **Points রিডিম করা**
- সঠিক customer _id পাঠানো হচ্ছে
- Convex validation পাস করছে

## শিক্ষা

### Convex এ ID ম্যানেজমেন্ট
1. সর্বদা document `_id` ব্যবহার করুন যখন `v.id("tableName")` validator ব্যবহার করছেন
2. কাস্টম ID ফিল্ড (যেমন `customerId`) শুধুমাত্র প্রদর্শনের জন্য বা রেফারেন্সের জন্য
3. মিউটেশনে document `_id` অন্তর্ভুক্ত করুন, কাস্টম ফিল্ড নয়

### TypeScript Casting সতর্কতা
- `as any` ব্যবহার করা এই ধরনের ত্রুটি লুকিয়ে রাখে
- সর্বদা সঠিক প্রকার পাঠান, casting এ নির্ভর করবেন না

## সংশোধিত কমিট
- **Commit**: `108897b`
- **বার্তা**: "Fix CustomerLoyalty - use _id instead of customerId for Convex mutations"
- **তারিখ**: 2026-01-28
