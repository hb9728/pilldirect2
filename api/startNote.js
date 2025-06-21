export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submission } = req.body;

  const prompt = `
Generate a clinical summary in 2–4 bullet points for a pharmacist:
- Patient: ${submission.firstName} ${submission.lastName}, DOB: ${submission.dob}
- Pill Choice: ${submission.pillChoice}
- Medical History: ${Array.isArray(submission.selectApplicable) ? submission.selectApplicable.join(', ') : 'None'}
- Extra Meds: ${submission.extraMeds || 'None'}
- BP: ${submission.bpSystolic}/${submission.bpDiastolic}
- Height: ${submission.heightFt || submission.heightCm}, Weight: ${submission.weightSt || submission.weightKg}
`;

  try {
    const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      version: "a05ef4bd013f86018cbe7148aa91870e485e71c9c57267f697eb4c0e5c34e4eb", // Mistral-7B-Instruct-v0.2
        input: {
          prompt,
          max_new_tokens: 200,
          temperature: 0.7
        }
      })
    });

    const prediction = await replicateRes.json();

    if (prediction.id) {
      return res.status(200).json({ id: prediction.id });
    } else {
      console.error("❌ Prediction start failed:", prediction);
      return res.status(500).json({ error: prediction.error || 'Replicate start failed' });
    }
  } catch (err) {
    console.error('❌ API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
