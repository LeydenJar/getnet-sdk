import axios from "axios";
import { IGetnetConfig } from "./IGetnetConfig";
import { GETNET_ENDPOINTS } from "./endpoints";

export class GetnetSdk {
  constructor(getnetConfig: IGetnetConfig) {
    this.config = getnetConfig;
    this.endpoints = GETNET_ENDPOINTS;
    if (this.config.useSandbox) {
      this.endpoints.baseUrl = "https://api-sandbox.getnet.com.br";
    } else {
      this.endpoints.baseUrl = "https://api-homologacao.getnet.com.br";
    }
  }

  config: IGetnetConfig;
  endpoints: any;

  async authenticate() {
    // Data has to be in form-urlencoded mode
    let data = new URLSearchParams();
    data.append("scope", "oob");
    data.append("grant_type", "client_credentials");

    // Client authentication in base64 string
    let stringToConvert = `${this.config.clientId}:${this.config.clientSecret}`;
    //@ts-ignore
    let b64s = new Buffer.from(stringToConvert).toString("base64");

    // Sending the request...
    let config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${b64s}`,
      },
    };

    console.log(this.endpoints.baseUrl);
    let url = this.endpoints.baseUrl + this.endpoints.getToken;
    let authRequestResponse;
    try {
      authRequestResponse = await axios.post(url, data, config);
    } catch (err) {
      console.log(err);
    }

    let res = authRequestResponse.data;

    return res.access_token;
  }

  async tokenizeCard(cardNumber: string, customerId?: string) {
    const authToken = await this.authenticate();
    let config = {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: "Bearer " + authToken,
      },
    };

    let url = this.endpoints.baseUrl + this.endpoints.tokenizeCard;
    let requestResponse;

    let data = {
      card_number: cardNumber,
    };

    //@ts-ignore
    customerId ? (data.customer_id = customerId) : null;

    try {
      requestResponse = await axios.post(url, data, config);
    } catch (err) {
      console.log(err.response.data);
    }

    let res = requestResponse.data;
    // console.log(requestResponse);
    return res;
  }

  async saveOnVault(cardData) {
    const authToken = await this.authenticate();
    let config = {
      headers: {
        Authorization: "Bearer " + authToken,
        seller_id: this.config.sellerId,
      },
    };

    let url = this.endpoints.baseUrl + this.endpoints.cards;

    let reqResponse;
    try {
      reqResponse = await axios.post(url, cardData, config);
    } catch (err) {
      console.log(err.response.data);
    }

    return reqResponse.data;
  }

  async removeFromVault(cardId) {
    const authToken = await this.authenticate();
    let config = {
      headers: {
        Authorization: "Bearer " + authToken,
        seller_id: this.config.sellerId,
      },
    };

    let url = this.endpoints.baseUrl + this.endpoints.cards + "/" + cardId;

    let reqResponse;
    try {
      reqResponse = await axios.delete(url, config);
    } catch (err) {
      console.log(err.response.data);
    }

    return reqResponse.data;
  }

  async getCardsFromUser(customerId) {
    const authToken = await this.authenticate();
    let config = {
      headers: {
        Authorization: "Bearer " + authToken,
        seller_id: this.config.sellerId,
      },
      params: {
        customer_id: customerId,
      },
    };

    let url = this.endpoints.baseUrl + this.endpoints.cards;
    let reqResponse;
    try {
      reqResponse = await axios.get(url, config);
    } catch (err) {
      console.log(err);
    }
    console.log(reqResponse);

    return reqResponse.data;
  }

  async getCard(cardId) {
    const authToken = await this.authenticate();
    let config = {
      headers: {
        Authorization: "Bearer " + authToken,
        seller_id: this.config.sellerId,
      },
    };

    let url = this.endpoints.baseUrl + this.endpoints.cards + "/" + cardId;
    let reqResponse;
    try {
      reqResponse = await axios.get(url, config);
    } catch (err) {
      console.log(err.response.data);
    }

    return reqResponse.data;
  }
}
