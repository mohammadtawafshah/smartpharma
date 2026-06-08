<?php
class JWT {
    private static $secret = 'smartpharma_super_secret_key_2025_xyz';
    private static $expire = 604800; // 7 days

    public static function encode(array $payload): string {
        $header  = self::b64(json_encode(['typ'=>'JWT','alg'=>'HS256']));
        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expire;
        $body    = self::b64(json_encode($payload));
        $sig     = self::b64(hash_hmac('sha256', "$header.$body", self::$secret, true));
        return "$header.$body.$sig";
    }

    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$header, $body, $sig] = $parts;
        $expected = self::b64(hash_hmac('sha256', "$header.$body", self::$secret, true));
        if (!hash_equals($expected, $sig)) return null;
        $payload = json_decode(self::b64d($body), true);
        if (!$payload || $payload['exp'] < time()) return null;
        return $payload;
    }

    private static function b64(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    private static function b64d(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
