# Simple Guide: Draw BMP Images in MIPS

This guide explains each step to draw a BMP image in MIPS (MARS/SPIM style), using a memory-mapped bitmap display.

## 1. Know the target display

Your bitmap display base address is usually a fixed memory location (example: `0x10008000`).

Each screen pixel is typically 4 bytes (one 32-bit word), stored as:
- Red in bits 23..16
- Green in bits 15..8
- Blue in bits 7..0

So one display color word looks like:

```text
0x00RRGGBB
```

## 2. Keep required data in `.data`

You need:
- BMP filename
- buffer size value
  - **Needs to be above or else saturn has alignment issues. Put the `.asciiz` types below all other labeled variables spaces.**
- input buffer large enough for the file
- display base pointer

Example:

```mipsasm
ADDR_DSPL:       .word 0x10008000

bmp_buffer_size: .word 40000
bmp_buffer:      .space 40000
BMP_FILENAME:    .asciiz "image.bmp"
```

## 3. Load BMP bytes from disk

Use syscalls:
- 13: open
- 14: read
- 16: close

Important detail:
- For syscall 14, `$a2` must be the size value, not the address of the size variable.

Example flow:

```mipsasm
# fd = open(filename, read_only)
li $v0, 13
la $a0, BMP_FILENAME
li $a1, 0
li $a2, 0
syscall
move $t0, $v0

# read(fd, buffer, buffer_size)
li $v0, 14
move $a0, $t0
la $a1, bmp_buffer
lw $a2, bmp_buffer_size
syscall

# close(fd)
li $v0, 16
move $a0, $t0
syscall
```

## 4. Read BMP header fields

For basic uncompressed 24-bit BMP, read:
- pixel data offset at byte 10 (4 bytes, little-endian)
- width at byte 18 (4 bytes, little-endian)
- height at byte 22 (4 bytes, little-endian)
- bits-per-pixel at byte 28 (2 bytes)

If your images are small and values fit in 16 bits, `lhu` can work for quick labs. For general BMP support, parse full 32-bit little-endian fields.

Example (quick lab version):

```mipsasm
la  $t9, bmp_buffer
lhu $t0, 18($t9)   # width
lhu $t1, 22($t9)   # height
lhu $t2, 10($t9)   # pixel array offset
```

## 5. Compute row byte sizes correctly

For 24-bit BMP:
- each pixel is 3 bytes (B, G, R)
- row_data_bytes = width * 3
- BMP rows are padded to multiples of 4 bytes

Formula:

```text
row_stride = (row_data_bytes + 3) & 0xFFFC
```

MIPS version:

```mipsasm
mul  $a2, $t0, 3         # row_data_bytes
add  $a3, $a2, 3
andi $a3, $a3, 0xFFFC    # row_stride
```

## 6. Iterate rows in BMP order

BMP stores pixel rows from bottom to top (for positive height BMP).

A practical loop:
- `i = height - 1` down to `0`
- row start byte index = `offset + i * row_stride`

```mipsasm
sub $t3, $t1, 1          # i = height - 1
row_loop:
  ...
sub $t3, $t3, 1          # i--
bge $t3, $zero, row_loop
```

## 7. Iterate columns by byte triplets

Inside a row:
- `j = 0` to `row_data_bytes - 1`, step by 3
- read B, G, R from `byte_pos + j`

```mipsasm
li $t5, 0
col_loop:
  ...
add $t5, $t5, 3               # j += 3
blt $t5, $a2, col_loop
```

## 8. Convert BMP BGR to display RGB word

Pack channels into `0x00RRGGBB`:

```mipsasm
add $t6, $t4, $t5          # blue_idx = byte_pos + j
add $t7, $t6, 1            # green_idx = byte_pos + j + 1
add $t8, $t6, 2            # red_idx = byte_pos + j + 2
lbu $t6, bmp_buffer($t6)   # blue = bmp_buffer[blue_idx]
lbu $t7, bmp_buffer($t7)   # green = bmp_buffer[green_idx]
lbu $t8, bmp_buffer($t8)   # red = bmp_buffer[red_idx]
sll $t8, $t8, 16           # R << 16
sll $t7, $t7, 8            # G << 8
or  $t8, $t8, $t7
or  $t8, $t8, $t6          # final color in $t8
```

## 9. Map BMP pixel position to display memory

Find screen coordinates:
- `pixel_x = destX + (j / 3)`
- `pixel_y = destY + (height - 1 - i)`

For a 256-pixel-wide display where each pixel is 4 bytes:
- byte offset = `(pixel_y * 256 + pixel_x) * 4`

Example write:

```mipsasm
div $t6, $t5, 3
add $t6, $t6, $a0        # pixel_x

sub $t7, $t1, $t3
addi $t7, $t7, -1
add $t7, $t7, $a1        # pixel_y

lw  $t9, ADDR_DSPL
sll $t6, $t6, 2          # x * 4
sll $t7, $t7, 2
sll $t7, $t7, 8          # y * 1024 (256*4)
add $t9, $t9, $t6
add $t9, $t9, $t7
sw  $t8, 0($t9)
```

## 10. Common bugs and fixes

1. Empty buffer after read:
- You passed address instead of size to syscall 14.
- Fix: use `lw $a2, bmp_buffer_size`.

2. Wrong colors:
- Row stride or byte stepping is wrong.
- Fix: column step must be 3 bytes and row loop must use padded stride.

3. Distorted or diagonal image:
- Using `width` where `row_data_bytes` or `row_stride` is required.

4. Upside-down image:
- BMP bottom-up order not handled.

5. Bad dimensions on larger images:
- Reading width/height with 8-bit or 16-bit loads only.
- Fix: parse full 32-bit little-endian fields.

## 11. Minimal checklist before drawing

- File opened successfully
- Read count is positive
- Bits-per-pixel is 24
- Width/height parsed correctly
- `row_data_bytes = width * 3`
- `row_stride = (row_data_bytes + 3) & 0xFFFC`
- Column loop bound is `row_data_bytes`
- Display address math matches your display width

## Python-Style Pseudocode 

```python
def load_bmp(path: str, max_size: int):
  fd = open_file_read_only(path)
  data = read_bytes(fd, max_size)
  close_file(fd)

def draw_bmp_to_display(
  buf: bytes,
  dest_x: int,
  dest_y: int,
):
  pixel_offset = buf[ 10 ]
  width = buf[ 18 ]
  height = buf[ 22 ]

  row_data_bytes = width * 3
  row_stride = 4 * math.ceil(row_data_bytes / 4)

  for i in range(height - 1, -1, -1):
    row_start = pixel_offset + i * row_stride

    for j in range(0, row_data_bytes, 3):
      blue = buf[row_start + j + 0]
      green = buf[row_start + j + 1]
      red = buf[row_start + j + 2]

      color = (red << 16) | (green << 8) | blue

      pixel_x = dest_x + (j // 3)
      pixel_y = dest_y + (height - 1 - i)

      display_index = pixel_y * display_width + pixel_x
      write_word(display_base + display_index * 4, color)
```

## MIPS 
```mipsasm
  .data

__unused_pusher: .space 17000000
# Immutable Data
# The address of the bitmap display. Don't forget to connect it!
ADDR_DSPL:
  .word 0x10008000


bmp_buffer_size: .word 36134
bmp_buffer: .space 36134
BMP_FILENAME: .asciiz "ev2.bmp"


# Code
  .text
  .globl main
j main

############################
# load sprite bitmap file
############################
load_bmp:
  
  li $v0, 13        # file = open(BMP_FILENAME, 'r')
  la $a0, BMP_FILENAME
  li $a1, 0         # read mode
  li $a2, 0         # unused arg
  syscall
  move $t0, $v0     # t0 = file

  li $v0, 14        # bmp_buffer = file.read()
  move $a0, $t0
  la $a1, bmp_buffer
  lw $a2, bmp_buffer_size
  syscall 

  li $v0, 16       # file.close()
  move $a0, $t0
  syscall

  jr $ra


############################
# a0 = x
# a1 = y
############################
draw_bmp:
  la $t9, bmp_buffer
  lhu $t0, 18($t9)             # t0 = width (pixels)
  lhu $t1, 22($t9)             # t1 = height (pixels)
  lhu $t2, 10($t9)             # t2 = pixel array offset

  # 24-bit BMP: row_data_bytes = width * 3, row_stride is 4-byte aligned
  mul $a2, $t0, 3              # a2 = row_data_bytes
  add $a3, $a2, 3
  andi $a3, $a3, 0xFFFC        # a3 = row_stride = row_bytes + 3 and set last 2 bits to 0

  # for t3 i = height - 1 to 0
  sub $t3, $t1, 1
  _draw_bmp_row_loop:
    # row start in bytes from BMP base (includes BMP row padding)
    mul $t4, $t3, $a3
    add $t4, $t4, $t2            # t4 byte_pos = i * row_stride + offset

    # for t5 j = 0 to j < row_data_bytes, with step j += 3
    li $t5, 0
    _draw_bmp_col_loop:
      add $t6, $t4, $t5          # blue_idx = byte_pos + j
      add $t7, $t6, 1            # green_idx = byte_pos + j + 1
      add $t8, $t6, 2            # red_idx = byte_pos + j + 2

      lbu $t6, bmp_buffer($t6)    # blue = bmp_buffer[blue_idx]
      lbu $t7, bmp_buffer($t7)    # green = bmp_buffer[green_idx]
      lbu $t8, bmp_buffer($t8)    # red = bmp_buffer[red_idx]

      sll $t8, $t8, 16       # red << 16
      sll $t7, $t7, 8        # green << 8
      or $t8, $t8, $t7       # t8 color = red | green | blue
      or $t8, $t8, $t6

      # draw a pixel, first calculate the index in disp buffer
      div $t6, $t5, 3          # pixel_x = destX + j / 3
      add $t6, $t6, $a0
      
      sub $t7, $t1, $t3        # pixel_y = destY + (height - 1 - i)
      addi $t7, $t7, -1
      add $t7, $t7, $a1

      lw $t9, ADDR_DSPL
      sll $t6, $t6, 2     # $t6 = $t6 * 4
      sll $t7, $t7, 2     # $t7 = $t7 * 4
      sll $t7, $t7, 8     # $t7 = $t7 * 256
      add $t9, $t9, $t6   # t9 + t6 + t7 is the start address for drawing
      add $t9, $t9, $t7   # t9 + t6 + t7 is the start address for drawing
      sw $t8, 0($t9)      # draw pixel with color

    add $t5, $t5, 3               # j += 3
    blt $t5, $a2, _draw_bmp_col_loop
  sub $t3, $t3, 1               # i--
  bge $t3, $zero, _draw_bmp_row_loop

  jr $ra

main:
  # load sprite
  jal load_bmp

  li $a0, 10
  li $a1, 10
  jal draw_bmp
  
  li $v0, 10
  syscall                         # syscall exit
```