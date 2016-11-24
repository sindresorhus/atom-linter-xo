/** @babel */
import {allowUnsafeNewFunction} from 'loophole';
import getPackagePath from './get-package-path';

// (base: string) => xo: Promise<Object>
export default function getXO(base) {
	const getResolvePath = () => base ? getPackagePath(base) : Promise.resolve();

	return getResolvePath()
		.then(() => {
			let xo = null;

			allowUnsafeNewFunction(() => {
				xo = require('xo');
			});

			return xo;
		});
}
