
import { GoogleGenAI, Type } from "@google/genai";
import { Appliance, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getLocationSuggestions(type: 'city' | 'district' | 'neighborhood', parentValue: string, context?: { province?: string, city?: string, district?: string }) {
  const prompt = `
    Como um especialista em geografia de Moçambique, forneça uma lista de 5 a 8 nomes reais de ${type === 'city' ? 'cidades ou municípios' : type === 'district' ? 'distritos' : 'bairros'} 
    que pertencem a: ${parentValue}.
    
    Contexto adicional:
    ${context?.province ? `Província: ${context.province}` : ''}
    ${context?.city ? `Cidade: ${context.city}` : ''}
    ${context?.district ? `Distrito: ${context.district}` : ''}

    Retorne APENAS um objeto JSON com a propriedade "suggestions" sendo um array de strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    return JSON.parse(response.text).suggestions;
  } catch (error) {
    console.error("Erro ao obter sugestões de localização:", error);
    return [];
  }
}

export async function getAIEnergyTips(appliances: Appliance[], profile: UserProfile) {
  const activeAppliances = appliances.filter(a => a.isActive);
  const totalDailyKwh = activeAppliances.reduce((acc, a) => acc + (a.power * a.hoursPerDay * (a.quantity || 1) / 1000), 0);
  
  const prompt = `
    Como assistente virtual do app ContaLuz (Moçambique), analise os aparelhos elétricos desta residência e forneça 3 dicas práticas de economia de energia personalizadas.
    
    Perfil: Residência tipo ${profile.residenceType} em ${profile.address}.
    Consumo estimado atual: ${totalDailyKwh.toFixed(2)} kWh/dia.
    Aparelhos principais (incluindo quantidades): ${activeAppliances.map(a => `${a.quantity}x ${a.name} (${a.power}W cada, ${a.hoursPerDay}h/dia cada)`).join(', ')}.
    
    Importante: Se houver múltiplos aparelhos iguais (ex: 10 lâmpadas), sugira reduzir a quantidade de unidades ligadas simultaneamente se apropriado.
    
    Retorne as dicas em formato JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedSaving: { type: Type.STRING, description: "Economia estimada em MT ou kWh" }
            },
            required: ["title", "description", "estimatedSaving"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao obter dicas do Gemini:", error);
    return [
      { title: "Desligue as luzes", description: "Lembre-se de desligar luzes em cômodos vazios.", estimatedSaving: "50 MT/mês" },
      { title: "Uso do Ferro", description: "Acumule roupas para engomar tudo de uma vez.", estimatedSaving: "120 MT/mês" }
    ];
  }
}

export async function getAutonomyStrategy(amount: number, days: number, appliances: Appliance[], profile: UserProfile) {
  const activeAppliances = appliances.filter(a => a.isActive);
  const kwhAvailable = amount / profile.tariffPerKWh;
  const kwhPerDayLimit = kwhAvailable / days;

  const prompt = `
    O usuário de Moçambique quer fazer uma recarga de ${amount} MT durar ${days} dias exatos.
    Tarifa: ${profile.tariffPerKWh} MT/kWh. Total disponível: ${kwhAvailable.toFixed(2)} kWh.
    Limite diário sugerido: ${kwhPerDayLimit.toFixed(2)} kWh/dia.
    
    Aparelhos atuais (incluindo quantidades): ${activeAppliances.map(a => `${a.quantity}x ${a.name} (${a.power}W cada, ${a.hoursPerDay}h/dia cada)`).join(', ')}.
    
    Crie uma estratégia de uso:
    1. Quais aparelhos devem ser desligados completamente?
    2. Quais aparelhos "secundários" devem ter tempo reduzido ou quantidade reduzida (ex: ligar apenas 2 lâmpadas em vez de 5)?
    3. Cronograma sugerido de uso.
    
    Retorne um JSON com:
    "explanation": Breve resumo da meta.
    "stopUsing": Lista de nomes de aparelhos para desligar.
    "reduceUsage": Lista de objetos { name, newTime, reason }.
    "dailyPlan": String descrevendo o plano diário.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            stopUsing: { type: Type.ARRAY, items: { type: Type.STRING } },
            reduceUsage: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: {
                  name: { type: Type.STRING },
                  newTime: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            dailyPlan: { type: Type.STRING }
          },
          required: ["explanation", "stopUsing", "reduceUsage", "dailyPlan"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro no simulador:", error);
    return null;
  }
}

export async function getMonthlyAnalysis(appliances: Appliance[], profile: UserProfile, diffPercent: number) {
  const activeAppliances = appliances.filter(a => a.isActive);
  const applianceList = activeAppliances.map(a => `${a.quantity}x ${a.name} (${(a.power * a.hoursPerDay * a.quantity / 1000).toFixed(2)} kWh/dia total)`).join(', ');
  
  const prompt = `
    Analise o consumo mensal de energia para um usuário em Moçambique.
    O consumo atual está ${Math.abs(diffPercent)}% ${diffPercent >= 0 ? 'superior' : 'inferior'} ao mês anterior.
    
    Aparelhos e consumo diário individual: ${applianceList}.
    Perfil: ${profile.residenceType} em ${profile.address}.
    
    Explique brevemente (máximo 3 frases) por que o consumo mudou, identificando quais aparelhos (e suas quantidades) são os maiores responsáveis pelo gasto ou pela economia. Seja específico.
    
    Retorne APENAS um objeto JSON com o campo "insight".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING }
          },
          required: ["insight"]
        }
      }
    });

    return JSON.parse(response.text).insight;
  } catch (error) {
    console.error("Erro ao obter análise mensal:", error);
    return `O consumo está ${Math.abs(diffPercent)}% ${diffPercent >= 0 ? 'mais alto' : 'mais baixo'}. Verifique o uso de aparelhos de alta potência ou a quantidade de lâmpadas ligadas para entender melhor a variação.`;
  }
}

export async function analyzeAppliancePlate(base64Image: string) {
  const prompt = `
    Analise a imagem desta placa de especificações técnicas de um eletrodoméstico.
    Extraia as seguintes informações:
    1. Potência (Power) em Watts (W). Procure por números seguidos de 'W' ou 'Watts'. Se estiver em 'kW', converta para 'W'.
    2. Tensão (Voltage) em Volts (V). Procure por 'V', 'Volts', '110V', '220V', etc.
    3. Modelo (Model). Procure por códigos alfanuméricos de modelo.
    4. Nome sugerido do aparelho baseado na placa (ex: 'Micro-ondas', 'Ferro de engomar').

    Retorne APENAS um objeto JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            power: { type: Type.NUMBER, description: "Potência em Watts" },
            voltage: { type: Type.STRING, description: "Tensão em Volts" },
            model: { type: Type.STRING, description: "Modelo do aparelho" },
            suggestedName: { type: Type.STRING, description: "Nome provável do aparelho" }
          },
          required: ["power"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro no OCR/IA:", error);
    throw new Error("Não foi possível ler a placa. Tente preencher manualmente.");
  }
}
