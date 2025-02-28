// Create a subscription link containing a configured fragment with random parameters in Cloudflare Workers.

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

// Utility functions
const selectRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

const generateRandomString = (length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const randomizeCase = (str) => str.split('').map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()).join('');

// Main handler function
async function handleRequest(request) {
    // Constants
    const portsList = [443, 8443, 2053, 2096, 2087, 2083];
    const domain = 'loyalty-is.pages.dev'; // Replace with your domain.
    const userUUID = '10432a5d-da29-4985-bb91-27cea3c151b6'; // Replace with your User UUID.
    const bestip = 'zula.ir'; // Replace with your preferred cf clean ip or your workers.dev / pages.dev domain.

    // Randomized constants
    const randomPort = selectRandomItem(portsList);
    const randomizedDomain = randomizeCase(domain);
    const randomPath = '/' + generateRandomString(59);


    // Configuration object
    const config = {
  "remarks": "REvil ⫤ϜɹɐɡϻϵŊͳ",
  "log": {
    "loglevel": "warning"
  },
  "dns": {
    "hosts": {},
    "servers": [
      "https://94.140.14.14/dns-query"
    ],
    "tag": "dns"
  },
  "inbounds": [
    {
      "port": 10808,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true,
        "userLevel": 8
      },
      "sniffing": {
        "destOverride": [
          "http",
          "tls"
        ],
        "enabled": true
      },
      "tag": "socks-in"
    },
    {
      "port": 10809,
      "protocol": "http",
      "settings": {
        "auth": "noauth",
        "udp": true,
        "userLevel": 8
      },
      "sniffing": {
        "destOverride": [
          "http",
          "tls"
        ],
        "enabled": true
      },
      "tag": "http-in"
    }
  ],
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": bestip,
            "port": randomPort,
            "users": [
              {
                "encryption": "none",
                "flow": "",
                "id": userUUID,
                "level": 8,
                "security": "auto"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "sockopt": {
          "dialerProxy": "fragment",
          "tcpKeepAliveIdle": 100,
          "tcpNoDelay": true
        },
        "tlsSettings": {
          "allowInsecure": false,
          "fingerprint": "chrome",
          "alpn": [
            "h2",
            "http/1.1"
          ],
          "serverName": randomizedDomain,
        },
        "wsSettings": {
          "headers": {
            "Host": randomizedDomain,
          },
          "path": randomPath,
        }
      },
      "tag": "proxy"
    },
    {
      "tag": "fragment",
      "protocol": "freedom",
      "settings": {
        "fragment": {
          "packets": "tlshello",
          "length": "10-30",
          "interval": "1-2"
        }
      },
      "streamSettings": {
        "sockopt": {
          "tcpKeepAliveIdle": 100,
          "tcpNoDelay": true
        }
      }
    },
    {
      "protocol": "dns",
      "tag": "dns-out"
    },
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "http"
        }
      },
      "tag": "block"
    }
  ],
  "policy": {
    "levels": {
      "8": {
        "connIdle": 300,
        "downlinkOnly": 1,
        "handshake": 4,
        "uplinkOnly": 1
      }
    },
    "system": {
      "statsOutboundUplink": true,
      "statsOutboundDownlink": true
    }
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "ip": [
          "8.8.8.8"
        ],
        "outboundTag": "direct",
        "port": "53",
        "type": "field"
      },
      {
        "inboundTag": [
          "socks-in",
          "http-in"
        ],
        "type": "field",
        "port": "53",
        "outboundTag": "dns-out",
        "enabled": true
      },
      {
        "outboundTag": "proxy",
        "type": "field",
        "network": "tcp,udp"
      }
    ]
  },
  "stats": {}
}

// Respond with the JSON configuration in pretty printed format
return new Response(JSON.stringify(config, null, 2), {
  headers: { 'content-type': 'application/json' }
});
}
