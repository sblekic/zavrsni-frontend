import { defineStore } from "pinia";
import { ethers, providers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import abi from "../abis/WavePortal.json";
import dateFormat from "dateformat";

// prebaci funkcije u try catch da možeš dohvaćati errore
// koristi if (this.ethereum) za provjeru ako postoji global api u window
// spremi adrese ugovora u .json datoteku u folderu gdje ćeš držati abi

export const useStore = defineStore("waveportal", {
  state: () => {
    return {
      account: null,
      waves: [],
      contract: {
        // "0xF7B7ab1dE3fba402e563E3F9b17547a0AADdB078" eth address
        address: "0xF7B7ab1dE3fba402e563E3F9b17547a0AADdB078",
        gasLimit: 300000,
      },
      network: {
        chainId: null,
      },
      loading: false,
      error: null,
    };
  },
  getters: {
    // getter napisan na ovaj način se ponaša kao vue computed property. on mi je dostupan putem ključne riječi this
    ethereum() {
      return window.ethereum;
    },
    provider() {
      //wrap the metamask injected object ethereum (js eth api/global api - eip1993 provider) into a ethers provider;
      //this means I can use the global
      return new providers.Web3Provider(window.ethereum);
    },
    // instanca ugovora u formatu js objekta (ethers)
    wavePortalContract(state) {
      const signer = this.provider.getSigner(
        //zašto prosljeđujem adresu walleta ili adresu ugovora?
        state.account ? state.account : state.contract.address
      );
      return new ethers.Contract(state.contract.address, abi.abi, signer);
    },
    isConnected: (state) => (state.account ? true : false),
    isWrongNetwork: (state) =>
      state.network.chainId ? state.network.chainId !== "0x5" : true,
  },
  actions: {
    // s ovime sam htio vidjeti ako this.ethereum mi vraća ono šta sam stavio u getter ethereum()
    logGet() {
      console.log("im in");
      console.log(window.ethereum);
    },
    async initialize() {
      console.log("i'm the method initialize()");
      const chainId = await this.ethereum.request({ method: "eth_chainId" });
      this.network.chainId = chainId;
      //na ethereum objekt koji je injected sa strane metamaska zakačim event listener; u ovom slučaju pratim
      //ako se user prebacio na drugi network. ovo je bitno je se svi rpc zahtjevi (request) vrše na trenutno spojeni BC.
      //ukratko, ako mi aplikacija radi na polygon network a ja šaljem zahtjeve na ethereum mainnet, vrlo vjerojatno neću dobiti željene rezultate.
      this.ethereum.on("chainChanged", () => {
        console.log("chainChanged");
        //kada mijenjam chain moram izvršiti reload stranice kako bih u state opet dohvatio chainId i zato što metamask dokumentacija tako kaže (a vjerojatno znaju oni bolje od mene)
        window.location.reload();
      });
    },
    async useMetamask() {
      console.log("useMetamask()");
      const provider = await detectEthereumProvider();
      // provider === window.ethereum
      if (provider) {
        console.log(provider);
        //eth_requestAccounts vraća polje koji sadrži jednu eth hex adresu
        const accounts = await this.ethereum.request({
          method: "eth_requestAccounts",
        });
        const chainId = await this.ethereum.request({ method: "eth_chainId" });

        // ovaj dio bi mogao biti koristan za verifikaciju računa;
        // ubacim u fn public key, message i signature te dobijem public key. ako dobiveni pk odgovara pk ownera računa onda je potpis valjan
        // getsigner mi vraća ethers signer obj

        // const signer = this.provider.getSigner(accounts[0]);

        // signMessage mi izbaci metamask window u kojem potpišem poruku koju sam stavio kao parametar funkcije signmessage("signthisbra") i vraća potpis
        // const signature = await signer.signMessage(accounts[0]);

        this.account = accounts[0];
        this.network.chainId = chainId;
        if (this.isWrongNetwork) await this.switchNetwork();
      } else this.error = "Install Metamask";
    },

    async switchNetwork() {
      await this.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }],
      });
      window.location.reload();
    },
    async fetchWaves() {
      const waves = await this.wavePortalContract.getAllWaves();
      this.waves = [];
      waves.forEach((wave) => {
        this.waves.push({
          waver: wave.waver,
          message: wave.message,
          emoji: wave.emoji,
          timestamp: dateFormat(
            new Date(wave.timestamp * 1000),
            "mmm dS, yyyy"
          ),
          rawDate: new Date(wave.timestamp * 1000),
          transaction: wave[0],
        });
      });
      this.waves = this.waves.sort((a, b) => b.rawDate - a.rawDate);
    },
    async sendWave(wave) {
      const waveTransaction = await this.wavePortalContract.wave(
        wave.message,
        wave.emoji,
        { gasLimit: this.contract.gasLimit }
      );
      // prisjeti se da ako se nešto treba rudariti moraš pričekati da rudarenje bude gotovo
      await waveTransaction.wait();
      await this.fetchWaves();
      return waveTransaction.hash;
    },
  },
});
