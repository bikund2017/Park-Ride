# 🚨 URGENT: Set These Environment Variables in Vercel

Your app is showing a blank screen because the backend environment variables are missing in Vercel.

## Copy these EXACT values to Vercel Dashboard:

### Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Add these variables (one by one):

**1. FIREBASE_PROJECT_ID**
```
park-ride
```

**2. FIREBASE_CLIENT_EMAIL**
```
firebase-adminsdk-fbsvc@park-ride.iam.gserviceaccount.com
```

**3. FIREBASE_PRIVATE_KEY** (IMPORTANT: Keep the quotes!)
```
"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3MvwO0Dsg6Fno\n9ynnzc/mAqYFjHRyAJfdPOo4j0l3qewLuaGd9bYTtO9vbOfUbD/t/fBhclnAhzKj\nOVQixtWiu2hU0gymc4hfZGkHjX41s0PPhWRNTs8hC+kRLqEJ5UbqN58E7DR4Z2Bd\nLv3xlVSf5JoEEJTKgr6DaXPjd4G+SrN0rmoZXV5fMpdDqXyjxafJ19hBsazHPTYs\n0AabElpLm9z5AkML9C5ZMkj7g3pjiRdKRGVKDRafWbeqCP1e/kZjm+U09DhDGWbO\nLGeCH84ZRyXwDbR3Y9MBTZueIJRi/GctQ/vQ59IOA8BTNAOg4h4/j42EznORdLQa\n9J2JUZZJAgMBAAECggEACZT+mbhq0fqlMpS0RJNqE4HsShpXFYa8wA3JbcI82afx\nwzPnOqUD7ChIumoWqXCCBYIvOlbp+ofNGRF3ZPGZHKUIZ3YBwwuu7y0IJfomHEvv\nOOGlZeUV214inMtKEVjvKnKp/BluAyWGZPP/b00xZcLmCrQNUZb2ElcygGFwpVHE\nmjV9McvSykBPmkCHhbBvKBcCKweVAfJRoqHsvjsIciL8ABd66gPKxlyBGIgL/NSV\ngaqvNb4IVpeEOfBxsgC1EeYoNjHKlyih2wyif/oO6s9zwO4mR4GwrkmQ01uwCN0+\npEJvgnz3XV5Q9dez1ak+0dp+Nb9kSNGtUC2GKJJ4ewKBgQDbLpaMAG0w3vXLmS66\nKljC0jUgb4satUS7bziwpBza+9KbMLTu0uQ6qfM4D1x3VDwybqU3sB7pk3OHn4eI\ng2ZieXU3wiEI35eNvrUu6qOpHPX0VfN6aHLBUuPSPPBEbalLWeWuQZeCqvSN+gjO\nAIlQGMtiimUHzJ444HGnmk7gcwKBgQDV+QnouxkVwjl+3MscOgXhjhWJNB2hekP9\nc5N5WkqSmr95ye8g9B1fhwVzmcEUvm0RzFW8ovx4wMd4I1mQ2vc+Bh2CGAXfmArX\nAWni8ntExd7pdGt3SVu6F7KOeRxxOcAh8wcwubw81zPRAywBW86bNd298sL88uhS\nFtZ7DGarUwKBgHD6KaWOjrnzIzVIBzr0mv4JBlNqy4P/zabjpJAAd9M0nJFb4Nd9\noyDN+015NYtYwxKnz8fNo5F4bMOKqnzmZj76Jj6QdSCyx9bLZ28AiU2hXPIN38vH\nzObzh/UVbi+Haw0pEGfq7WLwJdCNAj7VLfI4ZZWsinkjsqbUoiDnPCMbAoGAMBod\nRSmSeRbBsChYrM7KdatoYgDKTHvc/wRVeel3bD/Hncxsqp7WX5xN+G/vPQeWI3Mp\nLxAA6/CCpxpjTzI6dMIRLibSYzKd9TnHIRLb7VkCRL88TYO7UDl1lZvabgXKkJc+\n3ZBTpeXHK0yoPuHxr2jLoaEKfqzo11N1AhKGnisCgYBstO5MNDoGBlzrxTaAKr0S\n4JexA31uT9ufx9fpXhT3GZYT2sauD9iRTW8JJgYsYil/2MlF6cnW2BhtuCn7VxbC\n3FegKcfT0rj0CUv+Em9ilPd7gwV/XPBFTb/tp8GCdPG5c2yCXI5HX09a8OUqW3xw\n++2BVM8I82OA3WBUJhwH6w==\n-----END PRIVATE KEY-----\n"
```

**4. DELHI_TRANSIT_API_KEY**
```
mmmMLFBaiXLuPKuiDIwJuofBcVTSG6Qt
```

**5. ALLOWED_ORIGINS** (NO trailing slash!)
```
https://park-ride-new1.vercel.app
```

**6. NODE_ENV**
```
production
```

**7. JWT_SECRET**
```
bcb82aac57f50b8941bd93a3e5da72b520fe9de7d073fcffd1532ffc035b55c0bde310317add8246afd959e514ffd78948571ab87cf1061a76fa4c6a1b2023d5
```

## After adding all variables:

1. **Save** each variable
2. **Go to Deployments** tab in Vercel
3. **Click "Redeploy"** on the latest deployment
4. **Wait** for the redeploy to complete
5. **Test** your app again

## Your app should work after this!
