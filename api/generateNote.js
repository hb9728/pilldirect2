export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submission } = req.body;

  const prompt = `
Generate a brief clinical note for a UK pharmacist based on this contraceptive consultation:

Name: ${submission.firstName} ${submission.lastName}
DOB: ${submission.dob}
Preferred Pill: ${submission.pillChoice}
Medical History: ${Array.isArray(submission.selectApplicable) ? submission.selectApplicable.join(', ') : 'None'}
Current Medications: ${submission.extraMeds || 'None'}
Blood Pressure: ${submission.bpSystolic}/${submission.bpDiastolic}
Height: ${submission.heightFt || submission.heightCm}, Weight: ${submission.weightSt || submission.weightKg}

Summarise suitability for contraception in 2–4 bullet points, highlighting key risks or considerations.
`;

  try {
    const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "db21e45e230c8cf3c519942df8eefc8ee600e1f7c5f8708ad4eecc3fd4effc31", // LLaMA 3 8B Instruct
        input: {
          prompt: prompt,
          max_new_tokens: 200,
          temperature: 0.7
        }
      })
    });

    const prediction = await replicateRes.json();

    // Poll the endpoint until completion
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(r => setTimeout(r, 1000)); // wait 1s
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`
        }
      });
      result = await poll.json();
    }

    if (result.status === "succeeded") {
      const outputText = result.output?.join(' ') || '—';
      return res.status(200).json({ note: outputText });
    } else {
      console.error('❌ Replicate failed:', result.error);
      return res.status(500).json({ error: 'AI generation failed' });
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
