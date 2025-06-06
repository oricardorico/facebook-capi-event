
const crypto = require("crypto");
const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido. Use POST." });
  }

  const PIXEL_ID = "820884173290312";
  const ACCESS_TOKEN = "EAARuZCF4UqWgBO9qjbHC8JR4DhgaldsyZCTJTncKbf3JfHIgRO49zEUOlxfRQD1nO7b0YG5j3ZCfwdY6rFaHGNDt18FLuu7WbGE2H5ZAsD172ApNGos4fQqNZCCEHoEQ8iciVT3ZAj7xhcq1Tx9Patlo4aTQ4Fg0g6Jff0QhtGkZB0hJLvZB5s0AAKr7qIZAZCdwZDZD";

  try {
    const { Customer, Commissions } = req.body;

    if (!Customer?.email || !Commissions?.charge_amount) {
      return res.status(400).json({
        success: false,
        error: "Parâmetros 'Customer.email' e 'Commissions.charge_amount' são obrigatórios."
      });
    }

    const email = Customer.email;
    const valueCents = parseFloat(Commissions.charge_amount); // vem em centavos
    const valueReais = valueCents / 100;

    const hashedEmail = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: timestamp,
          action_source: "website",
          event_source_url: "https://plano8020.com.br/upsell/",
          user_data: {
            em: [hashedEmail]
          },
          custom_data: {
            currency: "BRL",
            value: valueReais
          }
        }
      ]
    };

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await axios.post(url, payload);

    res.status(200).json({ success: true, response: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, details: error.response?.data });
  }
};
