<template>
  <div class="burlang-keyboard" />
</template>

<script setup>
  onMounted(async () => {
    const input = document.getElementById('buryad-input');
    const { default: BurlangKeyboard } = await import('burlang-keyboard');

    const keyboard = new BurlangKeyboard('burlang-keyboard', {
      onChange: (v) => {
        input.value = v;
      },
      onKeyPress(button) {
        if (button === '{shift}' || button === '{lock}') handleShift();

        if (!button.includes('{')) {
          input.value += button;
        }
        if (button.includes('{space}')) {
          input.value += ' ';
        }
      },
    });

    function handleShift() {
      let currentLayout = keyboard.options.layoutName;
      let shiftToggle = currentLayout === 'default' ? 'shift' : 'default';

      keyboard.setOptions({
        layoutName: shiftToggle,
      });
    }
  });
</script>
