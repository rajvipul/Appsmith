export default {
  /**
   * Safely parse JSON from a TextArea
   */
  parseJson(text) {
    try {
      return JSON.parse(text || "{}");
    } catch (e) {
      showAlert("Invalid JSON format", "error");
      return {};
    }
  },

  /**
   * Get auth headers based on selected auth type
   */
  getAuthHeaders(authType, authFields) {
    if (authType === "basic") {
      const token = btoa(`${authFields.username}:${authFields.password}`);
      return { Authorization: `Basic ${token}` };
    }
    if (authType === "oauth2") {
      return { Authorization: `Bearer ${authFields.token}` };
    }
    if (authType === "aes") {
      // You can add real AES logic here with CryptoJS
      return { "X-AES-Key": authFields.key, "X-AES-IV": authFields.iv };
    }
    return {};
  },

  /**
   * Build headers: combine manual headers + auth headers
   */
  buildHeaders() {
    const rawHeaders = this.parseJson(cbHeaderJson.text);
    const authType = cbAuthType.selectedOptionValue;

    const authFields = {
      username: authUsername.text,
      password: authPassword.text,
      token: oauthToken.text,
      key: aesKey.text,
      iv: aesIv.text
    };

    return {
      ...rawHeaders,
      ...this.getAuthHeaders(authType, authFields)
    };
  },

  /**
   * Execute the callback API
   */
  async sendCallback() {
    const url = cbUrl.text;
    const method = cbMethod.selectedOptionValue;
    const headers = this.buildHeaders();
    const payload = this.parseJson(cbPayload.text);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: ["GET", "DELETE"].includes(method) ? undefined : JSON.stringify(payload)
      });

      const data = await response.json();
      showAlert("Callback sent successfully", "success");
      return data;
    } catch (err) {
      showAlert("Error sending callback: " + err.message, "error");
      return err;
    }
  }
};
