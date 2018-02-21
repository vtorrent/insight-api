'use strict';

var path = require('path'),
    fs = require('fs'),
    rootPath = path.normalize(__dirname + '/..'),
    env,
    db,
    port,
    b_port,
    p2p_port;

var packageStr = fs.readFileSync('package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || ( getUserHome()  + '/.insight' );

if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '3000';
  b_port = '22523';
  p2p_port = '22524';
}
else {
  env = 'testnet';
  db = home + '/testnet';
  port = '3001';
  b_port = '22521';
  p2p_port = '22525';
}


switch(process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'testnet';

var dataDir = process.env.VTORRENTD_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\vTorrent\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/vTorrent/';
  if (isLinux) dataDir = process.env.HOME + '/.vtorrent/';
}
dataDir += network === 'testnet' ? 'testnet' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache      = process.env.INSIGHT_IGNORE_CACHE || 0;


var vtorrentdConf = {
  protocol:  process.env.VTORRENTD_PROTO || 'http',
  user: process.env.VTORRENTD_USER || 'user',
  pass: process.env.VTORRENTD_PASS || 'pass',
  host: process.env.VTORRENTD_HOST || '127.0.0.1',
  port: process.env.VTORRENTD_PORT || b_port,
  p2pPort: process.env.VTORRENTD_P2P_PORT || p2p_port,
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

/*jshint multistr: true */
console.log(
'\n\
    ____           _       __    __     ___          _ \n\
   /  _/___  _____(_)___ _/ /_  / /_   /   |  ____  (_)\n\
   / // __ \\/ ___/ / __ `/ __ \\/ __/  / /\| \| / __ \\/ / \n\
 _/ // / / (__  ) / /_/ / / / / /_   / ___ |/ /_/ / /  \n\
/___/_/ /_/____/_/\\__, /_/ /_/\\__/  /_/  |_/ .___/_/   \n\
                 /____/                   /_/           \n\
\n\t\t\t\t\t\tv%s\n\
  # Configuration:\n\
\t\tNetwork: %s\tINSIGHT_NETWORK\n\
\t\tDatabase Path:  %s\tINSIGHT_DB\n\
\t\tSafe Confirmations:  %s\tINSIGHT_SAFE_CONFIRMATIONS\n\
\t\tIgnore Cache:  %s\tINSIGHT_IGNORE_CACHE\n\
 # Bicoind Connection configuration:\n\
\t\tRPC Username: %s\tVTORRENTD_USER\n\
\t\tRPC Password: %s\tVTORRENTD_PASS\n\
\t\tRPC Protocol: %s\tVTORRENTD_PROTO\n\
\t\tRPC Host: %s\tVTORRENTD_HOST\n\
\t\tRPC Port: %s\tVTORRENTD_PORT\n\
\t\tP2P Port: %s\tVTORRENTD_P2P_PORT\n\
\t\tData Dir: %s\tVTORRENTD_DATADIR\n\
\t\t%s\n\
\nChange setting by assigning the enviroment variables in the last column. Example:\n\
 $ INSIGHT_NETWORK="testnet" VTORRENTD_HOST="123.123.123.123" ./insight.js\
\n\n',
version,
network, home, safeConfirmations, ignoreCache?'yes':'no',
vtorrentdConf.user,
vtorrentdConf.pass?'Yes(hidden)':'No',
vtorrentdConf.protocol,
vtorrentdConf.host,
vtorrentdConf.port,
vtorrentdConf.p2p_port,
dataDir+(network==='testnet'?'*':''),
(network==='testnet'?'* (/testnet3 is added automatically)':'')
);


if (! fs.existsSync(db)){

  console.log('## ERROR ##\n\tDB Directory "%s" not found. \n\tCreate it, move your old DB there or set the INSIGHT_DB environment variable.\n\tNOTE: In older insight-api versions, db was stored at <insight-root>/db', db);
  process.exit(-1);
}

module.exports = {
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  vtorrentd: vtorrentdConf, 
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
};
