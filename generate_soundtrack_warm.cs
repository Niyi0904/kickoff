using System;
using System.IO;

public class SoundtrackGeneratorWarm
{
    const int SR = 44100;
    const double BPM = 118.0;
    const double BEAT_SEC = 60.0 / BPM;

    static Random rnd = new Random(42);

    // Timing constants (seconds)
    const double HERO_REVEAL_START = 14.2;  // held breath begins
    const double HERO_SWELL_START = 14.9;   // swell enters
    const double HERO_PEAK = 16.2;           // emotional peak
    const double BASS_ENTRY = 16.0;
    const double PERC_ENTRY = 22.0;
    const double WARMTH_ENTRY = 26.0;
    const double CLIMAX_ENTRY = 50.0;
    const double FINALE_ENTRY = 71.0;

    public static void Main()
    {
        double totalSec = 75.0;
        int totalSmp = (int)(SR * totalSec);
        float[] buf = new float[totalSmp];

        Console.Write("Generating layers...");

        // Foundation: warm atmospheric pads (0s → end)
        PadLayer(buf, 0, totalSec, new double[] { 146.83, 174.61, 110.00 }, 0.06);
        Console.Write(" atmo-low");
        PadLayer(buf, 0, totalSec, new double[] { 293.66, 349.23, 440.00 }, 0.03);
        Console.Write(" atmo-mid");

        // Soft melodic phrase — like a warm Rhodes electric piano
        SoftMelody(buf, 0, totalSec, 0.035);
        Console.Write(" keys");

        // Warm bass enters as the league page settles
        WarmBass(buf, BASS_ENTRY, totalSec, 0.07);
        Console.Write(" bass");

        // Gentle texture — a soft shaker + low thump
        SoftPercussion(buf, PERC_ENTRY, 70.0, 0.03);
        Console.Write(" perc");

        // Hero reveal swell — enters exactly as crest resolves
        PadLayer(buf, HERO_SWELL_START, 22.0, new double[] { 392.00, 440.00, 523.25, 587.33 }, 0.10);
        Console.Write(" swell");

        // Warmth fill — adds body from mid-video onward
        PadLayer(buf, WARMTH_ENTRY, totalSec, new double[] { 261.63, 329.63, 392.00, 466.16 }, 0.05);
        Console.Write(" warmth");

        // Textured high layer for the climax
        PadLayer(buf, CLIMAX_ENTRY, totalSec - 2, new double[] { 587.33, 698.46, 880.00, 1046.50 }, 0.04);
        Console.Write(" highs");

        // Final resolved D major chord — lands on end card
        FinalChord(buf, FINALE_ENTRY, totalSec, 0.12);
        Console.Write(" finale");

        // Dynamic volume envelope
        for (int i = 0; i < buf.Length; i++)
        {
            double t = (double)i / SR;
            double gain = 1.0;

            // Fade in (0-4s) — very quiet intro
            if (t < 4.0) gain = 0.35 * (t / 4.0);
            // Restrained opening (4-13.2s) — sparse, atmospheric
            else if (t < 13.2) gain = 0.35 + 0.10 * (t - 4.0) / 9.2;
            // Held breath (13.2-14.2s) — pull back for anticipation
            else if (t < 14.2) gain = 0.45 - 0.30 * (t - 13.2) / 1.0;
            // Swell into hero reveal (14.2-16.2s) — emotional peak arrives
            else if (t < 16.2) gain = 0.15 + 0.75 * (t - 14.2) / 2.0;
            // Settle after reveal (16.2-22s) — warmth holds
            else if (t < 22.0) gain = 0.90;
            // Building (22-50s) — gradual rise through matches/standings/teams
            else if (t < 50.0) gain = 0.90 + 0.15 * (t - 22.0) / 28.0;
            // Climax build (50-62s) — full texture for stats/create-league
            else if (t < 62.0) gain = 1.05 + 0.15 * (t - 50.0) / 12.0;
            // Peak (62-71s) — "Create Your League" at full warmth
            else if (t < 71.0) gain = 1.20;
            // Final chord settle (71-73s) — resolve to final note
            else if (t < 73.0) gain = 1.20 - 0.35 * (t - 71.0) / 2.0;
            // Final silence (73-75s) — chord decays naturally
            else gain = 0.85 * (1.0 - (t - 73.0) / 2.0);

            buf[i] *= (float)gain;
        }

        // Normalize peak to 0.95
        float peak = 0;
        for (int i = 0; i < buf.Length; i++)
            peak = Math.Max(peak, Math.Abs(buf[i]));
        float normGain = peak > 0 ? 0.95f / peak : 0;
        for (int i = 0; i < buf.Length; i++)
            buf[i] *= normGain;

        short[] data = new short[buf.Length];
        for (int i = 0; i < buf.Length; i++)
            data[i] = (short)(buf[i] * 32767);
        Console.WriteLine();

        WriteWav(data, "kickoff-video/public/soundtrack.wav");
        Console.WriteLine("Generated {0} samples, {1:F2}s", data.Length, data.Length / (double)SR);
    }

    static double Interp(double t, double t1, double t2, double v1, double v2)
    {
        if (t <= t1) return v1;
        if (t >= t2) return v2;
        return v1 + (v2 - v1) * (t - t1) / (t2 - t1);
    }

    static void PadLayer(float[] buf, double startSec, double endSec, double[] freqs, double vol)
    {
        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));
        double totalDur = endSec - startSec;

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            double env = 1.0;
            if (tl < 4.0) env = tl / 4.0;
            if (totalDur - tl < 3.0) env *= (totalDur - tl) / 3.0;

            double smp = 0;
            for (int fi = 0; fi < freqs.Length; fi++)
            {
                double f = freqs[fi];
                smp += Math.Sin(2 * Math.PI * f * t) * 0.6;
                smp += Math.Sin(2 * Math.PI * f * 2.003 * t) * 0.12;
                smp += Math.Sin(2 * Math.PI * f * 0.501 * t) * 0.20;
            }
            smp /= freqs.Length;
            smp *= env * vol;
            buf[i] += (float)smp;
        }
    }

    static void SoftMelody(float[] buf, double startSec, double endSec, double vol)
    {
        double[] notes = { 293.66, 349.23, 440.00, 349.23, 293.66, 261.63, 293.66, 349.23 };
        double noteLen = BEAT_SEC * 2;

        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            int noteIdx = (int)(tl / noteLen) % notes.Length;
            double f = notes[noteIdx];

            double env = 1.0;
            if (tl < 3.0) env = tl / 3.0;
            double dur = endSec - startSec;
            if (dur - tl < 3.0) env *= (dur - tl) / 3.0;

            double notePhase = (tl / noteLen) % 1.0;
            double noteEnv = Math.Exp(-notePhase * 2.5);

            double snd = Math.Sin(2 * Math.PI * f * t) * 0.7
                       + Math.Sin(2 * Math.PI * f * 2.01 * t) * 0.12
                       + Math.Sin(2 * Math.PI * f * 0.5 * t) * 0.15;
            snd *= env * noteEnv * vol;
            buf[i] += (float)snd;
        }
    }

    static void WarmBass(float[] buf, double startSec, double endSec, double vol)
    {
        double[] roots = { 146.83, 146.83, 110.00, 110.00, 146.83, 146.83, 174.61, 196.00 };
        int patBeats = roots.Length;

        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            int beatIdx = (int)(tl / BEAT_SEC) % patBeats;
            double f = roots[beatIdx];
            double phaseInBeat = (tl / BEAT_SEC) % 1.0;
            double amp = 1.0 - phaseInBeat * 0.2;
            if (tl < 3.0) amp *= tl / 3.0;

            double smp = Math.Sin(2 * Math.PI * f * t) * 0.6
                       + Math.Sin(2 * Math.PI * f * 2.01 * t) * 0.12;
            smp *= amp * vol;
            buf[i] += (float)smp;
        }
    }

    static void SoftPercussion(float[] buf, double startSec, double endSec, double vol)
    {
        for (double beat = 0; ; beat += 1.0)
        {
            double time = startSec + beat * BEAT_SEC;
            if (time >= endSec) break;
            int pos = (int)(time * SR);
            if (pos >= buf.Length) break;

            // Soft shaker
            int dur = (int)(0.02 * SR);
            for (int j = 0; j < dur && pos + j < buf.Length; j++)
            {
                double tj = (double)j / SR;
                double env = Math.Exp(-tj * 120);
                double noise = rnd.NextDouble() * 2 - 1;
                buf[pos + j] += (float)(noise * env * 0.08 * vol);
            }

            if ((int)beat % 2 == 0)
            {
                int thumpDur = (int)(0.06 * SR);
                for (int j = 0; j < thumpDur && pos + j < buf.Length; j++)
                {
                    double tj = (double)j / SR;
                    double env = Math.Exp(-tj * 50);
                    double s = Math.Sin(2 * Math.PI * 60 * tj);
                    buf[pos + j] += (float)(s * env * 0.12 * vol);
                }
            }
        }
    }

    static void FinalChord(float[] buf, double startSec, double endSec, double vol)
    {
        double[] freqs = { 293.66, 369.99, 440.00, 587.33 };

        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));
        double totalDur = endSec - startSec;

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            double env = 1.0;
            if (tl < 2.0) env = tl / 2.0;
            if (totalDur - tl < 2.0) env *= (totalDur - tl) / 2.0;

            double smp = 0;
            for (int fi = 0; fi < freqs.Length; fi++)
            {
                double f = freqs[fi];
                smp += Math.Sin(2 * Math.PI * f * t) * 0.5;
                smp += Math.Sin(2 * Math.PI * f * 2.003 * t) * 0.08;
                smp += Math.Sin(2 * Math.PI * f * 0.5 * t) * 0.20;
            }
            smp /= freqs.Length;
            smp *= env * vol;
            buf[i] += (float)smp;
        }
    }

    static void WriteWav(short[] data, string path)
    {
        using (var fs = new FileStream(path, FileMode.Create))
        using (var bw = new BinaryWriter(fs))
        {
            int dataSize = data.Length * 2;
            int fileSize = 36 + dataSize;

            bw.Write(new char[] { 'R', 'I', 'F', 'F' });
            bw.Write(fileSize);
            bw.Write(new char[] { 'W', 'A', 'V', 'E' });
            bw.Write(new char[] { 'f', 'm', 't', ' ' });
            bw.Write(16);
            bw.Write((short)1);
            bw.Write((short)1);
            bw.Write(SR);
            bw.Write(SR * 2);
            bw.Write((short)2);
            bw.Write((short)16);
            bw.Write(new char[] { 'd', 'a', 't', 'a' });
            bw.Write(dataSize);

            foreach (short s in data)
                bw.Write(s);
        }
    }
}
