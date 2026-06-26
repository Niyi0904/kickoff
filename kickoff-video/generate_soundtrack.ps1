# Optimized cinematic soundtrack generator
$sr = 22050
$dur = 120
$total = $sr * $dur
$bpm = 118
$beat = [int]($sr * 60 / $bpm)

$path = "C:\Users\LG\Desktop\project\team_management\kickoff-video\public\soundtrack.wav"
$fs = [System.IO.File]::Create($path)

# Pre-compute sin table (lookup for speed)
$sinTbl = [double[]]::new(1024)
for ($i = 0; $i -lt 1024; $i++) { $sinTbl[$i] = [Math]::Sin(2 * [Math]::PI * $i / 1024.0) }
function SinL([double]$p) {
  $idx = [int]($p / (2 * [Math]::PI) * 1024) % 1024
  return $sinTbl[$idx]
}

# Pseudo-random noise (no Get-Random in inner loop)
$rndState = 12345
function Noise() { $script:rndState = ($script:rndState * 1103515245 + 12345) % 2147483648; return $script:rndState / 1073741824.0 - 1.0 }

# Chord table
$chords = @(@(261.63,329.63,392.00), @(196.00,246.94,392.00), @(220.00,261.63,440.00), @(174.61,220.00,349.23))

# WAV header
$ds = $total * 4
$fs.Write([Text.Encoding]::ASCII.GetBytes("RIFF"),0,4)
$fs.Write([BitConverter]::GetBytes([int32]($ds+36)),0,4)
$fs.Write([Text.Encoding]::ASCII.GetBytes("WAVE"),0,4)
$fs.Write([Text.Encoding]::ASCII.GetBytes("fmt "),0,4)
$fs.Write([BitConverter]::GetBytes([int32]16),0,4)
$fs.Write([BitConverter]::GetBytes([int16]1),0,2)
$fs.Write([BitConverter]::GetBytes([int16]2),0,2)
$fs.Write([BitConverter]::GetBytes([int32]$sr),0,4)
$fs.Write([BitConverter]::GetBytes([int32]($sr*4)),0,4)
$fs.Write([BitConverter]::GetBytes([int16]4),0,2)
$fs.Write([BitConverter]::GetBytes([int16]16),0,2)
$fs.Write([Text.Encoding]::ASCII.GetBytes("data"),0,4)
$fs.Write([BitConverter]::GetBytes([int32]$ds),0,4)

$chunk = 4410  # 0.2s chunks
$buf = [byte[]]::new($chunk * 4)

$ph_pad = @(0.0, 0.0, 0.0)
$ph_bass = 0.0
$ph_str0 = 0.0; $ph_str1 = 0.0; $ph_str2 = 0.0

for ($i = 0; $i -lt $total; $i += $chunk) {
  $rem = [Math]::Min($chunk, $total - $i)
  for ($j = 0; $j -lt $rem; $j++) {
    $t = ($i + $j) / $sr
    $bp = ($i + $j) / $beat
    $cIdx = [int][Math]::Floor($bp / 4.0) % 4
    $cf = $chords[$cIdx]
    $bInBar = $bp % 4.0
    $bPh = $bInBar - [Math]::Floor($bInBar)

    # Volume automation
    $pv = [Math]::Min(1.0,$t/5.0); if ($t -gt 100) { $pv *= [Math]::Max(0.0,(120-$t)/20) }
    $bv = 0.0; if ($t -gt 14) { $bv = [Math]::Min(1.0,($t-14)/10.0); if ($t -gt 105) { $bv *= [Math]::Max(0.0,(120-$t)/15) } }
    $pev = 0.0; if ($t -gt 14) { $pev = [Math]::Min(1.0,($t-14)/8.0); if ($t -gt 108) { $pev *= [Math]::Max(0.0,(120-$t)/12) } }
    $cv = 0.0; if ($t -gt 38) { $cv = [Math]::Min(1.0,($t-38)/15.0); if ($t -gt 110) { $cv *= [Math]::Max(0.0,(120-$t)/10) } }
    $cb = 1.0; if ($t -gt 68 -and $t -lt 102) { $cb = 1.0+0.3*[Math]::Sin(($t-68)/34.0*[Math]::PI) }

    # Pad (detuned sines)
    $pF = 130.81
    $pd = @(SinL($ph_pad[0]), SinL($ph_pad[1]), SinL($ph_pad[2]))
    $ph_pad[0] += 2*[Math]::PI*$pF/$sr; $ph_pad[1] += 2*[Math]::PI*($pF+0.3)/$sr; $ph_pad[2] += 2*[Math]::PI*($pF-0.3)/$sr
    $lfo = 0.5+0.5*[Math]::Sin(2*[Math]::PI*0.15*$t)
    $pad = ($pd[0]+$pd[1]+$pd[2])/3.0*0.5*$lfo

    # Bass
    $bass = 0.0
    if ($bv -gt 0.01) {
      $bass += SinL($ph_bass) * (1.0-[Math]::Min(1.0,$bPh/0.1)) * 0.6
      $ph_bass += 2*[Math]::PI*65.41/$sr
    }

    # Percussion
    $perc = 0.0
    if ($pev -gt 0.01) {
      if ($bPh -lt 0.02) { $kE = 1.0-$bPh/0.02; $kF=[Math]::Max(40,80-$bPh*3000); $perc += SinL(2*[Math]::PI*$kF*$bPh*0.5)*$kE*0.4*$cb }
      $ep = ($bInBar*2)%1.0; if ($ep -lt 0.01) { $hE = 1.0-$ep/0.01; $nz = (Noise)*0.5; if ($t -gt 68) { $nz*=1.3 }; $perc += $nz*$hE*0.15 }
    }

    # Chord arpeggio
    $chordOut = 0.0
    if ($cv -gt 0.01) {
      $aStep = ($bp*2)%1.0; $nIdx = [int][Math]::Floor($aStep*3)%3; $aTrg = ($aStep*3)%1.0
      if ($aTrg -lt 0.15) { $aE=1.0-$aTrg/0.15; $aF=$cf[$nIdx]*2; $s=SinL(2*[Math]::PI*$aF*$t); $chordOut=$s*$aE*0.25*$cb }
    }

    # String layer (climax)
    $str = 0.0
    if ($t -gt 38 -and $t -lt 72) { $rp=($t-38)/34.0; $str += SinL(2*[Math]::PI*(80+$rp*600)*$t)*[Math]::Sin($rp*[Math]::PI)*0.04 }
    if ($t -gt 68 -and $t -lt 105) {
      $sv = [Math]::Sin(($t-68)/37.0*[Math]::PI)*0.08
      $str += (SinL($ph_str0)+SinL($ph_str1)+SinL($ph_str2))/3.0*$sv
      $ph_str0 += 2*[Math]::PI*$cf[0]/$sr; $ph_str1 += 2*[Math]::PI*$cf[1]/$sr; $ph_str2 += 2*[Math]::PI*($cf[2]/2)/$sr
    }

    # Mix
    $mix = $pad*$pv*0.35 + $bass*$bv*0.4 + $perc*$pev + $chordOut*$cv + $str
    $mix *= 0.45
    if ($mix -gt 1.0) { $mix = 1.0 }; if ($mix -lt -1.0) { $mix = -1.0 }
    $s16 = [int]($mix*32767)
    if ($s16 -gt 32767) { $s16=32767 }; if ($s16 -lt -32768) { $s16=-32768 }
    $idx=$j*4; $buf[$idx]=[byte]($s16-band0xFF); $buf[$idx+1]=[byte](($s16-shr8)-band0xFF)
    $buf[$idx+2]=[byte]($s16-band0xFF); $buf[$idx+3]=[byte](($s16-shr8)-band0xFF)
  }
  $fs.Write($buf,0,$rem*4)
  $pct=[int](($i+$rem)/$total*100); Write-Progress "Soundtrack" -PercentComplete $pct -Status "$pct%"
}
$fs.Close()
$size=(Get-Item $path).Length
Write-Output "Generated: soundtrack.wav ($size bytes)"
