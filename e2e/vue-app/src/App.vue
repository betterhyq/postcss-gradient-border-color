<template>
  <div class="container">
    <div class="box-linear" data-testid="box-linear" />
    <div class="box-radial" data-testid="box-radial" />
    <div class="box-conic" data-testid="box-conic" />
    <div class="box-plain" data-testid="box-plain" />
  </div>
</template>

<style>
.container {
  display: flex;
  gap: 24px;
  padding: 32px;
  flex-wrap: wrap;
  background: #1a1a1a;
  min-height: 100vh;
}

.box-linear {
  width: 200px;
  height: 120px;
  border: 3px solid;
  border-color: linear-gradient(to right, #f06, #48f);
  border-radius: 12px;
}

.box-radial {
  width: 200px;
  height: 120px;
  border: 3px solid;
  border-color: radial-gradient(circle, #f06, #48f);
  border-radius: 50%;
}

.box-conic {
  width: 200px;
  height: 120px;
  border: 3px solid;
  border-color: conic-gradient(#f06, #48f, #0fa, #f06);
  border-radius: 12px;
}

.box-plain {
  width: 200px;
  height: 120px;
  border: 3px solid red;
  border-radius: 12px;
}
</style>
