const hours = 1

export const HTTPCacheOptions = {
  expires: new Date(new Date().setHours(new Date().getHours() + hours)),
  ttl: 60 * 60 * hours
}
