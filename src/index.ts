import { handleFileUpload } from './uploadCSV';

document.getElementById('csvFileInput')?.addEventListener('change', handleFileUpload);
document.getElementById('uploadButton')?.addEventListener('click', () => {
  const input = document.getElementById('csvFileInput') as HTMLInputElement;
  if (input) {
    handleFileUpload({
      target: input,
      bubbles: false,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      currentTarget: null,
      defaultPrevented: false,
      eventPhase: 0,
      isTrusted: false,
      returnValue: false,
      srcElement: null,
      timeStamp: 0,
      type: '',
      composedPath: function (): EventTarget[] {
        throw new Error('Function not implemented.');
      },
      initEvent: function (type: string, bubbles?: boolean, cancelable?: boolean): void {
        throw new Error('Function not implemented.');
      },
      preventDefault: function (): void {
        throw new Error('Function not implemented.');
      },
      stopImmediatePropagation: function (): void {
        throw new Error('Function not implemented.');
      },
      stopPropagation: function (): void {
        throw new Error('Function not implemented.');
      },
      NONE: 0,
      CAPTURING_PHASE: 1,
      AT_TARGET: 2,
      BUBBLING_PHASE: 3
    });
  }
});
