const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("Servers:", dns.getServers());

dns.resolveSrv(
  "_mongodb._tcp.healzone-cluster.hl9vou2.mongodb.net",
  (err, records) => {
    console.log(err || records);
  }
);